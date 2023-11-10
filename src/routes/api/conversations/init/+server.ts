import {collection_conversations} from "$db/collections";
import type {
    Conversation,
    ConversationInsert,
    ConversationInsertRequest,
    ConversationInsertResponse,
    Message_Offer
} from "../../types";
import {ConversationState, isConversationRequest, UserRole} from "../../types";
import {
    getCurrentDateTime,
    getResponse_BadRequest,
    getResponse_InternalError,
    getResponse_Success,
    getResponse_Unauthorized
} from "../../tools";
import {sendInitMessage} from "../../messages/send/+server";
import {checkUserRole, getUser} from "../../auth/auth";

function checkExisting(usernames:{ customer: string; serviceprovider: string; }) {
    //todo
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

        //Chekc foe existing conversation
        if(checkExisting(request.usernames)) {
            return getResponse_BadRequest();
        }

        //Insert new conversation
        let new_conversation:ConversationInsert = {
            "usernames": {
                "customer": request.usernames.customer,
                "serviceprovider": request.usernames.serviceprovider
            },
            "state": ConversationState.Quoted,
            "dates": {
                "created": getCurrentDateTime(),
                "updated": getCurrentDateTime(),
                "opened": "",
                "deleted": "",
            },
        }

        const result = await collection_conversations.insertOne(new_conversation);

        if(result.acknowledged) {
            let conversationID = result.insertedId
            let conversation:Conversation = {
                _id: conversationID.toString(),
                ...new_conversation
            };
            //Insert starting message
            let sent: Message_Offer | null = await sendInitMessage(currentUser,request.initMessage)
            if(sent != null) {
                let data:ConversationInsertResponse = {
                    conversation: conversation,
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