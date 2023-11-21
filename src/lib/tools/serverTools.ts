import {collection_auth, collection_conversations, collection_messages} from "$db/collections";
import {ObjectId} from "mongodb";
import type {Conversation, User, UserObj, Message, TextMessage} from "../types";
import {ConversationState, MessageType, UserRole} from "../types";
import {getOtherUsername} from "$lib/tools/clientTools";
import AWS from "aws-sdk";
import {
    SECRET_STORAGE_S3_ACCESSKEY, SECRET_STORAGE_S3_BUCKET_NAME,
    SECRET_STORAGE_S3_ENDPOINT,
    SECRET_STORAGE_S3_REGION,
    SECRET_STORAGE_S3_SECRETKEY
} from "$env/static/private";
import crypto from "crypto";

/**********************/
/* Response Templates */
/**********************/

//BASIC
export function getResponse_Success(data: any = {}) {
    let jsonBody = {
        success:true,
        data:data
    }
    return new Response(JSON.stringify(jsonBody), {
        headers: {
            'Content-Type': 'application/json'
        },
        status: 200
    })
}

export function getResponse_ErrorCode(code:number) {
    return new Response(JSON.stringify({success:false}), {
        headers: {
            'Content-Type': 'application/json',
        },
        status: code
    });
}

//PREDEFINED CODES
export function getResponse_BadRequest() {
    return getResponse_ErrorCode(400);
}

export function getResponse_InternalError() {
    return getResponse_ErrorCode(500);
}

export function getResponse_Unauthorized() {
    return getResponse_ErrorCode(401);
}

/**********************/
/*       Helpers      */
/**********************/

//Dates
export function getCurrentDateTime(): string {
    return new Date().toISOString();
}

//Database
export function extractFindData<GenericType>(data: any[]):GenericType[] {
    return data.map(item => ({
        ...item,
        _id: item._id.toString()
    })) as unknown as GenericType[];
}

//Users
export async function isUserConversationParticipant(user:User,conversationID:string) {
    let conversation = await getConversation(conversationID);
    if(conversation != null) {
        if(user.type == UserRole.ServiceProvider) {
            if(conversation.usernames.serviceprovider == user.username) return true;
        }
        else{
            if(conversation.usernames.customer == user.username) return true;
        }
    }
    return false
}
export async function getPictureURL(conversation:Conversation,currentUser:User) {
    const data = await collection_auth.find({username:getOtherUsername(currentUser,conversation.usernames)},{limit:1, projection: {}}).toArray()
    let users:UserObj[] = extractFindData<UserObj>(data);

    if (users.length >= 1) {
        return users[0].pictureURL != undefined ? users[0].pictureURL : "";
    }
    else{
        return "";
    }
}

//Conversations
export async function setConversationState(id:string,state:ConversationState) {
    let data;
    if(state == ConversationState.Accepted) {
        data ={
            "state": state,
            "dates.updated": getCurrentDateTime(),
            "dates.accepted": getCurrentDateTime(),
        }
    }
    else{
        data ={
            "state": state,
            "dates.updated": getCurrentDateTime(),
        }
    }
    const res = await collection_conversations.updateOne( { _id: new ObjectId(id) },
        {
            $set: data
        });
    return res.acknowledged;
}

export async function updateConversation(conversation:Conversation) {
    const res1 = await collection_conversations.updateOne( { _id: new ObjectId(conversation._id) },
        {
            $set: {
                "dates.updated": getCurrentDateTime()
            }
        });
    return res1.acknowledged;
}

export async function checkExistingConversation(usernames:{ customer: string; serviceprovider: string; }) {
    const data = await collection_conversations.find({"usernames.customer":usernames.customer,"usernames.serviceprovider":usernames.serviceprovider},{limit:1, projection: {}}).toArray()
    let conversations:Conversation[] = extractFindData<Conversation>(data);
    return conversations.length >= 1;
}

export async function getConversation(id:string) {
    const data = await collection_conversations.find({_id:new ObjectId(id)},{limit:1, projection: {}}).toArray()
    let conversations:Conversation[] = extractFindData<Conversation>(data);
    if (conversations.length >= 1) {
        return conversations[0];
    }
    else{
        return null;
    }
}

export async function getLastMessage(conversation:Conversation) {
    const data = await collection_messages.find({conversationID:conversation._id},{limit:1, projection: {}}).sort({"dates.created": -1}).toArray()
    let msgs:Message[] = extractFindData<Message>(data);

    if (msgs.length >= 1) {
        return msgs[0];
    }
    else{
        return null;
    }
}

export async function getUnreadCount(conversation:Conversation,currentUser:User) {
    return await collection_messages.countDocuments({conversationID:conversation._id, read: false, 'sender.username': { '$ne': currentUser.username } },{});
}

//Messages
export function maskMessages(conversation:Conversation ,msgs:Message[]) {
    if(conversation.state == ConversationState.Quoted || conversation.state == ConversationState.Chatting) {
        return msgs.map((msg:Message):Message => {
            if(msg.messageType == MessageType.File) return msg;
            else {
                let textMsg:TextMessage = msg as TextMessage;
                textMsg.text = filterContactData(textMsg.text);
                return textMsg;
            }
        })
    }
    else return msgs;
}

export function filterContactData(text:string) {
    text = maskEmail(text);
    text = maskURLs(text);
    text = maskPhone(text);
    return text;
}

export function maskURLs(input:string) {
    const domainRegex: RegExp = /(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}/g;
    input = input.replace(domainRegex, (m:string) => '*'.repeat(m.length));
    return input
}

export function maskPhone(input:string) {
    const phoneRegex: RegExp = /(\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*)/g;
    input = input.replace(phoneRegex, (match:string) => match.replace(/\d/g, '*'));
    return input
}

export function maskEmail(input:string) {
    const emailRegex: RegExp = /(?<=\w*)[\w\-._+%]*(?=\w*@)/g;
    input = input.replace(emailRegex, (m: string) => '*'.repeat(m.length));
    return input
}

//Files
export function getExtension(filename:string) {
    var parts = filename.split('.');
    return parts[parts.length - 1];
}

export function checkFileAllowed(filename:string) {
    let ext = getExtension(filename);
    let allowed = ['jpg','jpeg','gif','bmp','webp','png','wav','mp3','mp4','mov','pdf','txt'];
    return allowed.includes(ext.toLowerCase());
}

export function checkFileSize(file:File,maxGB:number) {
    return file.size <= maxGB*1024*1024*1024;
}

export function getS3Connection() {
    return new AWS.S3({
        accessKeyId: SECRET_STORAGE_S3_ACCESSKEY,
        secretAccessKey: SECRET_STORAGE_S3_SECRETKEY,
        region: SECRET_STORAGE_S3_REGION,
        endpoint: SECRET_STORAGE_S3_ENDPOINT
    });
}

export function createS3Directory(s3:AWS.S3, directoryName:string) {
    const params2 = {
        Bucket: SECRET_STORAGE_S3_BUCKET_NAME,
        Key: directoryName,
        Body: '',
    };
    return s3.putObject(params2);
}

export async function s3Upload(s3:AWS.S3, file:File, uploadLocation:string) {
    const params = {
        Bucket: SECRET_STORAGE_S3_BUCKET_NAME,
        Key: uploadLocation,
        Body: Buffer.from(await file.arrayBuffer()),
    };

    try {
        return await s3.upload(params).promise();
    } catch (error) {
        return false;
    }
}

//Random
export function getRandomUUID(iterations:number = 4) {
    if(iterations < 1) iterations = 1
    let randomString:string = crypto.randomUUID();
    for(let i = 0; i < iterations-1; i++) {
        randomString += "-"+crypto.randomUUID();
    }
    return randomString
}