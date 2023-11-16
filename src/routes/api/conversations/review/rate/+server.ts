import {collection_conversations} from "$db/collections";
import {ObjectId} from "mongodb";
import {type ConversationReviewRatingRequest, UserRole} from "$lib/types";
import {checkUserRole, getUser} from "$lib/auth";
import {
    getResponse_BadRequest,
    getResponse_Success,
    getResponse_Unauthorized,
    isUserConversationParticipant
} from "$lib/tools/serverTools";

export async function POST(event:any) {
    let currentUser = await getUser(event.cookies);
    if(currentUser == null) return getResponse_Unauthorized();

    const body = await event.request.json();
    let request:ConversationReviewRatingRequest = body.data;

    if(
        (!(await isUserConversationParticipant(currentUser,request.conversationID))) ||
        (!checkUserRole(currentUser,UserRole.Customer))
    ) {
        return getResponse_Unauthorized();
    }

    const res1 = await collection_conversations.updateOne( { _id: new ObjectId(request.conversationID), "review.reviewed": { $ne: true } },
        {
            $set: {
                "review.reviewed": true,
                "review.rating": request.review.rating
            }
        });

    if(res1.modifiedCount >= 1){
        return getResponse_Success()
    }
    else{
        return getResponse_BadRequest();
    }
}
