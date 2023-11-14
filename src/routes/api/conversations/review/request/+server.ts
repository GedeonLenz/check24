import {collection_conversations} from "$db/collections";
import {ObjectId} from "mongodb";
import {type ConversationUpdateRequest, UserRole} from "../../../types";
import {checkUserRole, getUser} from "../../../auth/auth";
import {
    getResponse_InternalError,
    getResponse_Success,
    getResponse_Unauthorized,
    isUserConversationParticipant
} from "../../../tools";

export async function POST(event:any) {
    let currentUser = await getUser(event.cookies);
    if(currentUser == null) return getResponse_Unauthorized();

    const body = await event.request.json();
    let request:ConversationUpdateRequest = body.data;

    if(!(await isUserConversationParticipant(currentUser,request.conversationID))) {
        return getResponse_Unauthorized();
    }

    if(!checkUserRole(currentUser,UserRole.ServiceProvider)) {
        return getResponse_Unauthorized();
    }

    const res1 = await collection_conversations.updateOne( { _id: new ObjectId(request.conversationID) },
        {
            $set: {
                "review.requested": true
            }
        });

    if(res1.acknowledged){
        return getResponse_Success()
    }
    else{
        return getResponse_InternalError();
    }
}
