import {collection_conversations} from "$db/collections";
import {type ConversationUpdateRequest, UserRole,} from "../../types";
import {
    getConversation,
    getCurrentDateTime,
    getResponse_BadRequest,
    getResponse_InternalError,
    getResponse_Success,
    getResponse_Unauthorized,
    isUserConversationParticipant
} from "$lib/serverTools";
import {getUser} from "$lib/auth";
import {ObjectId} from "mongodb";

export async function POST(event:any) {
    let currentUser = await getUser(event.cookies);
    if(currentUser == null) return getResponse_Unauthorized();

    const body = await event.request.json();
    let request:ConversationUpdateRequest = body.data;

    if(!(await isUserConversationParticipant(currentUser,request.conversationID))) {
        return getResponse_Unauthorized();
    }

    let currentConversation = await getConversation(request.conversationID);
    if(currentConversation == null) {
        return getResponse_BadRequest();
    }

    let update;
    if (currentUser.type == UserRole.ServiceProvider) {
        update = {
            $set: {
                "archived.serviceprovider": true,
                "dates.updated": getCurrentDateTime(),
                "dates.archived.serviceprovider": getCurrentDateTime()
            }
        }
    }
    else{
        update = {
            $set: {
                "archived.customer": true,
                "dates.updated": getCurrentDateTime(),
                "dates.archived.customer": getCurrentDateTime()
            }
        }
    }
    const res = await collection_conversations.updateOne( { _id: new ObjectId(request.conversationID) },update);
    if (res.acknowledged){
        return getResponse_Success();
    }
    else{
        return getResponse_InternalError();
    }
}
