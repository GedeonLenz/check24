import {collection_conversations} from "$db/collections";
import {ObjectId} from "mongodb";
import {type ConversationUpdateRequest, UserRole} from "$lib/types";
import {checkUserRole, getUser} from "$lib/auth";
import {
    getResponse_BadRequest,
    getResponse_Success,
    getResponse_Unauthorized,
    isUserConversationParticipant
} from "$lib/serverTools";

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

    const res1 = await collection_conversations.updateOne( { _id: new ObjectId(request.conversationID), "review.requested": { $ne: true } },
        {
            $set: {
                "review.requested": true
            }
        });

    if(res1.modifiedCount >= 1){
        return getResponse_Success()
    }
    else{
        return getResponse_BadRequest();
    }
}
