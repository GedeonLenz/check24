import {
    type Conversation,
    ConversationState, type Message_File, type Message_FileInsert,
    type Message_FileRequest,
    type MessageRequest,
    MessageType, type NewMessage_FileResponse,
    UserRole
} from "../../../types";
import { promises as fsPromises } from 'fs';
import {
    getConversation, getCurrentDateTime,
    getResponse_BadRequest, getResponse_ErrorCode, getResponse_InternalError, getResponse_Success,
    getResponse_Unauthorized,
    isUserConversationParticipant, setConversationState, updateConversation
} from "../../../tools";
import {checkUserRole, getUser} from "../../../auth/auth";
import type {ObjectId} from "mongodb";
import {collection_messages} from "$db/collections";
import { writeFileSync } from 'fs';
import * as crypto from "crypto";
import AWS from 'aws-sdk';

import {SECURE_STORAGE_S3_BUCKET_NAME,SECURE_STORAGE_S3_ACCESSKEY,SECURE_STORAGE_S3_SECRETKEY,SECURE_STORAGE_S3_REGION,SECURE_STORAGE_S3_DIRECTORY,SECURE_STORAGE_S3_PUBLIC_URL,SECURE_STORAGE_S3_ENDPOINT} from "$env/static/private";

function getExtension(filename:string) {
    var parts = filename.split('.');
    return parts[parts.length - 1];
}

function checkFileAllowed(filename:string) {
    let ext = getExtension(filename);
    let allowed = ['jpg','jpeg','gif','bmp','webp','png','wav','mp3','mp4','mov','pdf','txt'];
    if(allowed.includes(ext.toLowerCase())) return true;
    return false;
}

export async function POST(event:any) {
    let currentUser = await getUser(event.cookies);
    if(currentUser == null) return getResponse_Unauthorized();

    //Request data
    const formData = Object.fromEntries(await event.request.formData());

    let file:File = formData.file
    let requestMessage:MessageRequest = JSON.parse(formData.message);
    let messageType:MessageType = requestMessage.messageType;

    //Checks
    if(requestMessage.sender.username != currentUser.username || requestMessage.sender.type != currentUser.type) {
        return getResponse_Unauthorized();
    }

    let currentConversation:Conversation | null = await getConversation(requestMessage.conversationID);
    if(currentConversation == null) {
        return getResponse_BadRequest();
    }

    if(!(await isUserConversationParticipant(currentUser,requestMessage.conversationID))) {
        return getResponse_Unauthorized();
    }

    if(messageType == MessageType.File){
        if(
            (
                (
                    currentConversation.state == ConversationState.Quoted ||
                    currentConversation.state == ConversationState.Rejected
                )
                &&
                checkUserRole(currentUser,UserRole.Customer)
            )
            ||
            (
                (
                    currentConversation.state == ConversationState.Chatting ||
                    currentConversation.state == ConversationState.Accepted
                )
                &&
                (
                    checkUserRole(currentUser,UserRole.Customer) ||
                    checkUserRole(currentUser,UserRole.ServiceProvider)
                )
            )
        ) {
            let message = requestMessage as Message_FileRequest

            //File checks
            let maxGB = 2;
            if(file.size > maxGB*1024*1024*1024) {
                return getResponse_ErrorCode(413);
            }
            if(!checkFileAllowed(file.name)) {
                return getResponse_ErrorCode(415);
            }

            //Upload file
            let randomString:string = crypto.randomUUID();
            for(let i = 0; i < 3; i++) {
                randomString += "-"+crypto.randomUUID();
            }

            const s3 = new AWS.S3({
                accessKeyId: SECURE_STORAGE_S3_ACCESSKEY,
                secretAccessKey: SECURE_STORAGE_S3_SECRETKEY,
                region: SECURE_STORAGE_S3_REGION,
                endpoint: SECURE_STORAGE_S3_ENDPOINT
            });

            let directoryName = randomString;
            let s3ObjectKey = SECURE_STORAGE_S3_DIRECTORY + directoryName;
            const params2 = {
                Bucket: SECURE_STORAGE_S3_BUCKET_NAME,
                Key: s3ObjectKey,
                Body: '',
            };
            s3.putObject(params2);

            s3ObjectKey =  s3ObjectKey+"/" + file.name;
            const params = {
                Bucket: SECURE_STORAGE_S3_BUCKET_NAME,
                Key: s3ObjectKey,
                Body: Buffer.from(await file.arrayBuffer()),
            };

            try {
                await s3.upload(params).promise();
            } catch (error) {
                return getResponse_InternalError();
            }

            let finalURL = SECURE_STORAGE_S3_PUBLIC_URL+s3ObjectKey

            //Insert DB message
            let messageToInsert:Message_FileInsert = {
                conversationID: currentConversation._id,
                sender: message.sender,
                messageType: message.messageType,
                read:false,
                filePath: finalURL,
                dates: {
                    created: getCurrentDateTime(),
                    updated: getCurrentDateTime(),
                    read: "",
                },
            }

            const result = await collection_messages.insertOne(messageToInsert);

            if(result.acknowledged) {
                if(currentConversation.state == ConversationState.Quoted) {
                    const updated: boolean = await setConversationState(currentConversation._id, ConversationState.Chatting);
                    if (!updated) {
                        return getResponse_InternalError();
                    }
                }
                const updated: boolean = await updateConversation(currentConversation);
                if (!updated) {
                    return getResponse_InternalError();
                }
                let messageID:ObjectId = result.insertedId
                let finalMessage: Message_File = {
                    _id: messageID.toString(),
                    ...messageToInsert
                };
                let response:NewMessage_FileResponse = {
                    message: finalMessage,
                    fileURL: ""
                }
                return getResponse_Success(response);
            }

        }
        else {
            return getResponse_BadRequest();
        }
    }
    else{
        return getResponse_BadRequest();
    }
}