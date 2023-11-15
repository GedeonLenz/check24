import type {Conversation, User, UserObj} from "./types";
import {collection_auth, collection_conversations, collection_messages} from "$db/collections";
import {ConversationState, type Message, UserRole} from "./types";
import {ObjectId} from "mongodb";
import {getOtherUsername} from "../clientTools";

export function getCurrentDateTime(): string {
    return new Date().toISOString();
}

export function extractFindData<GenericType>(data: any[]):GenericType[] {
    return data.map(item => ({
        ...item,
        _id: item._id.toString()
    })) as unknown as GenericType[];
}

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

export function getResponse_BadRequest() {
    return getResponse_ErrorCode(400);
}

export function getResponse_InternalError() {
    return getResponse_ErrorCode(500);
}

export function getResponse_Unauthorized() {
    return getResponse_ErrorCode(401);
}

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