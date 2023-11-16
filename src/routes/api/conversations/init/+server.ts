import {collection_auth, collection_conversations} from "$db/collections";
import type {
    Conversation, ConversationEntry,
    ConversationInsert,
    ConversationInsertRequest,
    ConversationInsertResponse,
    Message_Offer
} from "../../types";
import {ConversationState, isConversationRequest, type UserObj, UserRole} from "../../types";
import {
    extractFindData,
    getCurrentDateTime, getPictureURL,
    getResponse_BadRequest,
    getResponse_InternalError,
    getResponse_Success,
    getResponse_Unauthorized,
} from "$lib/serverTools";
import {_sendInitMessage} from "../../messages/send/+server";
import {checkUserRole, getUser} from "$lib/auth";

async function checkExisting(usernames:{ customer: string; serviceprovider: string; }) {
    const data = await collection_conversations.find({"usernames.customer":usernames.customer,"usernames.serviceprovider":usernames.serviceprovider},{limit:1, projection: {}}).toArray()
    let conversations:Conversation[] = extractFindData<Conversation>(data);
    return conversations.length >= 1;
}
async function userExists(username:String,role:UserRole) {
    const data = await collection_auth.find({username:username},{limit:1, projection: {}}).toArray()
    let userObjs = extractFindData<UserObj>(data);
    if (userObjs.length >= 1) {
        if(userObjs[0].type == role) {
            return true;
        }
    }
    return false;
}
/*Init Conversation POST*/
export async function POST(event:any) {
    //Check Login validity / permissions
    let currentUser = await getUser(event.cookies);
    if(currentUser == null || !checkUserRole(currentUser,UserRole.ServiceProvider)) return getResponse_Unauthorized();

    const body = await event.request.json();
    const data = body.data;

    if(isConversationRequest(data)) {
        let request:ConversationInsertRequest = data;

        //Validate currentUser is part of conversation
        if(currentUser.username != request.usernames.serviceprovider) {
            return getResponse_BadRequest();
        }

        if(!await userExists(request.usernames.customer,UserRole.Customer)) {
            return getResponse_BadRequest();
        }

        if(await checkExisting(request.usernames)) {
            return getResponse_BadRequest();
        }

        //Insert new conversation
        let new_conversation:ConversationInsert = {
            "usernames": {
                "customer": request.usernames.customer,
                "serviceprovider": request.usernames.serviceprovider
            },
            "state": ConversationState.Initalizing,
            "dates": {
                "created": getCurrentDateTime(),
                "updated": getCurrentDateTime(),
                "opened": ""
            },
        }

        const result = await collection_conversations.insertOne(new_conversation);
        if(result.acknowledged) {
            let conversationID = result.insertedId.toString()
            let conversation:Conversation = {
                _id: conversationID,
                ...new_conversation
            };
            //Insert starting message
            let sent: Message_Offer | null = await _sendInitMessage(currentUser,request.initMessage,conversation)
            if(sent != null) {
                conversation.state = ConversationState.Quoted;
                let conversationEntry:ConversationEntry = {conversationObj:conversation,lastMessage: sent, unreadCount:0,pictureURL:await getPictureURL(conversation,currentUser)};
                let data:ConversationInsertResponse = {
                    conversation: conversationEntry,
                    message:sent
                }
                return getResponse_Success(data)
            }
        }
        return getResponse_InternalError();
    }
    else{
        return getResponse_BadRequest();
    }
}