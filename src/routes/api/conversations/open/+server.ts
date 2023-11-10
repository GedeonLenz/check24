import {collection_conversations, collection_messages} from "$db/collections";
import {ConversationState, type ConversationUpdateRequest, MessageType, UserRole} from "../../types";
import {
    getCurrentDateTime,
    getResponse_Unauthorized
} from "../../tools";
import {checkUserRole, getUser} from "../../auth/auth";
import {ObjectId} from "mongodb";

export async function POST(event:any) {
    let currentUser = await getUser(event.cookies);
    if(currentUser == null) return getResponse_Unauthorized();

    const body = await event.request.json();
    let request:ConversationUpdateRequest = body.data;

    const res1 = await collection_conversations.updateOne( { _id: new ObjectId(request.conversationID) },
        {
            $set: {
                "state": ConversationState.Archived,
                "date.opened": getCurrentDateTime()
            }
        });

    const res2 = await collection_messages.updateMany( { conversationID: new ObjectId(request.conversationID) },
        {
            $set: {
                "read": true
            }
        });

    return (res1.acknowledged && res2.acknowledged);
}
