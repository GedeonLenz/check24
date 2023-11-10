
/*GET / Filter List of Conversations*/
import {getUser} from "../../auth/auth";
import {extractFindData, getResponse_InternalError, getResponse_Success, getResponse_Unauthorized} from "../../tools";
import {collection_auth, collection_conversations, collection_messages} from "$db/collections";
import {ObjectId} from "mongodb";
import type {
    Conversation,
    ConversationListRequest,
    ConversationListResponse, Message,
    User
} from "../../types";

export async function GET(event:any) {
    let currentUser:User | null = await getUser(event.cookies);
    if(currentUser == null) return getResponse_Unauthorized();

    const body = await event.request.json();
    //todo add checks
    let request:ConversationListRequest = body.data;

    const data = await collection_conversations.find(request.query,{skip: request.offset, limit:request.amount, projection: {}}).toArray()
    let conversations:Conversation[] = extractFindData<Conversation>(data);

    let conversationEntries:{ conversationObj: Conversation, lastMessage: Message, unreadCount: number }[] = [];

    for (const conversation of conversations) {
        let lastMessage:Message | null= await getLastMessage(conversation);
        if(lastMessage == null) {
            return getResponse_InternalError();
        }
        let unreadCount:number = await getUnreadCount(conversation);
        conversationEntries.push({conversationObj:conversation,lastMessage: lastMessage, unreadCount:unreadCount});
    }


    let response:ConversationListResponse = {
        conversations: conversationEntries
    }
    return getResponse_Success(response);
}


async function getLastMessage(conversation:Conversation) {
    const data = await collection_messages.find({conversationID:conversation._id},{limit:1, projection: {}}).sort({"dates.created": -1}).toArray()
    let msgs:Message[] = extractFindData<Message>(data);

    if (msgs.length >= 1) {
        return msgs[0];
    }
    else{
        return null
    }
}

async function getUnreadCount(conversation:Conversation) {
    return await collection_messages.countDocuments({conversationID:conversation._id, read: false},{});
}