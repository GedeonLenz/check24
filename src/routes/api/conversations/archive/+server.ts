import {ObjectId} from "mongodb";
import {collection_conversations} from "$db/collections";
import {type ConversationUpdateRequest, UserRole,} from "$lib/types";
import {getUser} from "$lib/auth";
import {
    getConversation,
    getCurrentDateTime,
    getResponse_BadRequest,
    getResponse_InternalError,
    getResponse_Success,
    getResponse_Unauthorized,
    isUserConversationParticipant
} from "$lib/tools/serverTools";

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

    const roleKey = currentUser.type === UserRole.ServiceProvider ? "serviceprovider" : "customer";

    const update = {
        $set: {
            [`archived.${roleKey}`]: true,
            "dates.updated": getCurrentDateTime(),
            [`dates.archived.${roleKey}`]: getCurrentDateTime()
        }
    };
    const res = await collection_conversations.updateOne( { _id: new ObjectId(request.conversationID) },update);
    if (res.acknowledged){
        return getResponse_Success();
    }
    else{
        return getResponse_InternalError();
    }
}
