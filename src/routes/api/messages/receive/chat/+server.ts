
/*GET / Filter List of Conversations*/
import {getUser} from "../../../auth/auth";
import {extractFindData, getResponse_Unauthorized} from "../../../tools";
import type {ChatMessagesRequest, ChatMessagesResponse, MessageRequest} from "../../../types";
import {collection_messages} from "$db/collections";
import type {Message} from "../../../types";

export async function GET(event:any) {

    //todo main logic for receiving messages (2)
    let currentUser = await getUser(event.cookies);
    if(currentUser == null) return getResponse_Unauthorized();
    //todo add checks
    const body = await event.request.json();
    let request:ChatMessagesRequest = body.data;

    const data = await collection_messages.find({conversationID:request.conversationID},{skip: request.offset, limit:request.amount, projection: {}}).sort({"dates.created": -1}).toArray()
    let msgs:Message[] = extractFindData<Message>(data);

    let response:ChatMessagesResponse = {
        messages: msgs
    }


}