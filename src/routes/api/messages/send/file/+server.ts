import {
    type Conversation,
    ConversationState, type Message_File, type Message_FileInsert,
    type Message_FileRequest,
    type MessageRequest,
    MessageType, type NewMessage_FileResponse,
    UserRole
} from "$lib/types";
import {
    checkFileAllowed, checkFileSize, createS3Directory,
    getConversation, getCurrentDateTime, getRandomUUID,
    getResponse_BadRequest, getResponse_ErrorCode, getResponse_InternalError, getResponse_Success,
    getResponse_Unauthorized, getS3Connection,
    isUserConversationParticipant, s3Upload, setConversationState, updateConversation
} from "$lib/tools/serverTools";
import {checkUserRole, getUser} from "$lib/auth";
import type {ObjectId} from "mongodb";
import {collection_messages} from "$db/collections";

import {
    SECRET_STORAGE_S3_DIRECTORY,
    SECRET_STORAGE_S3_PUBLIC_URL,
} from "$env/static/private";

export async function POST(event:any) {
    let currentUser = await getUser(event.cookies);
    if(currentUser == null) return getResponse_Unauthorized();

    //Request data
    const formData = Object.fromEntries(await event.request.formData());
    let file:File = formData.file
    let requestMessage:MessageRequest = JSON.parse(formData.message);
    let messageType:MessageType = requestMessage.messageType;

    //Checks
    let currentConversation:Conversation | null = await getConversation(requestMessage.conversationID);
    if(currentConversation == null) {
        return getResponse_BadRequest();
    }

    if(
        (requestMessage.sender.username != currentUser.username || requestMessage.sender.type != currentUser.type) ||
        (!(await isUserConversationParticipant(currentUser,requestMessage.conversationID)))
    ) {
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
            if(!checkFileSize(file,maxGB)) {
                return getResponse_ErrorCode(413);
            }
            if(!checkFileAllowed(file.name)) {
                return getResponse_ErrorCode(415);
            }

            //Upload file
            let s3 = getS3Connection();
            let directoryName = getRandomUUID();
            let fileLocation = SECRET_STORAGE_S3_DIRECTORY + directoryName;
            createS3Directory(s3,fileLocation)

            fileLocation =  fileLocation + "/" + file.name;
            let res = await s3Upload(s3,file,fileLocation);
            if(res == false){
                return getResponse_InternalError();
            }

            let finalURL = SECRET_STORAGE_S3_PUBLIC_URL+fileLocation
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
                if(currentConversation.state === ConversationState.Quoted) {
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
    }
    return getResponse_BadRequest();
}