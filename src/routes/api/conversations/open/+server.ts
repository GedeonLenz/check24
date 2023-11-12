import {collection_conversations, collection_messages} from "$db/collections";
import type {ConversationUpdateRequest} from "../../types";
import {
    getCurrentDateTime, getResponse_InternalError, getResponse_Success,
    getResponse_Unauthorized, isUserConversationParticipant
} from "../../tools";
import {checkUserRole, getUser} from "../../auth/auth";
import {ObjectId} from "mongodb";

export async function POST(event:any) {
    let currentUser = await getUser(event.cookies);
    if(currentUser == null) return getResponse_Unauthorized();

    const body = await event.request.json();
    let request:ConversationUpdateRequest = body.data;

    if(!(await isUserConversationParticipant(currentUser,request.conversationID))) {
        return getResponse_Unauthorized();
    }

    const res1 = await collection_conversations.updateOne( { _id: new ObjectId(request.conversationID) },
        {
            $set: {
                "dates.opened": getCurrentDateTime()
            }
        });

    const res2 = await collection_messages.updateMany( { conversationID: request.conversationID, 'sender.username': { '$ne': currentUser.username } },
        {
            $set: {
                "read": true,
                "dates.read":getCurrentDateTime(),
                "dates.updated":getCurrentDateTime()
            }
        });
    if(res1.acknowledged && res2.acknowledged){
        return getResponse_Success()
    }
    else{
        return getResponse_InternalError();
    }
}
