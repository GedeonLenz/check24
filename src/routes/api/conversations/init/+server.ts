import {collection_auth, collection_conversations} from "$db/collections";
import {checkUserRole, getUser, userExists} from "$lib/auth";
import {ConversationState, isConversationRequest, type UserObj, UserRole} from "$lib/types";
import {
    checkExistingConversation,
    getCurrentDateTime, getPictureURL,
    getResponse_BadRequest,
    getResponse_InternalError,
    getResponse_Success,
    getResponse_Unauthorized,
} from "$lib/tools/serverTools";
import {_sendInitMessage} from "../../messages/send/+server";
import type {
    Conversation, ConversationEntry,
    ConversationInsert,
    ConversationInsertRequest,
    ConversationInsertResponse,
    Message_Offer
} from "$lib/types";
/*Init Conversation POST*/
export async function POST(event:any) {
    //Check Login validity / permissions
    let currentUser = await getUser(event.cookies);
    if(currentUser == null || !checkUserRole(currentUser,UserRole.ServiceProvider)) return getResponse_Unauthorized();

    const body = await event.request.json();
    const data = body.data;

    if(isConversationRequest(data)) {
        let request:ConversationInsertRequest = data;

        if(
            (currentUser.username != request.usernames.serviceprovider) ||
            (!await userExists(request.usernames.customer,UserRole.Customer)) ||
            (await checkExistingConversation(request.usernames))
        ) {
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