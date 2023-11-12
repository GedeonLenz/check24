/*GET / Filter List of Conversations*/
import {collection_messages} from "$db/collections";
import {getUser} from "../../auth/auth";
import {
    extractFindData,
    getConversation,
    getResponse_BadRequest,
    getResponse_Success,
    getResponse_Unauthorized,
    isUserConversationParticipant
} from "../../tools";
import type {ChatMessagesRequest, ChatMessagesResponse, Conversation, Message, TextMessage} from "../../types";
import {ConversationState, MessageType} from "../../types";

export async function GET(event:any) {
    let currentUser = await getUser(event.cookies);
    if(currentUser == null) return getResponse_Unauthorized();

    let url = event.url;
    let conversationID = url.searchParams.get('conversationID') ?? -1;
    let offset = Number(url.searchParams.get('offset') ?? '0');
    let amount = Number(url.searchParams.get('amount') ?? '0');

    if(conversationID == -1 || (await getConversation(conversationID)) == null) {
        return getResponse_BadRequest();
    }

    let request:ChatMessagesRequest = {
        conversationID:conversationID,
        offset:offset,
        amount:amount
    }

    if(!(await isUserConversationParticipant(currentUser,request.conversationID))) {
        return getResponse_Unauthorized();
    }

    let currentConversation:Conversation | null = await getConversation(request.conversationID)
    if(currentConversation == null) {
        return getResponse_BadRequest();
    }

    const data = await collection_messages.find({conversationID:currentConversation._id},{skip: request.offset, limit:request.amount, projection: {}}).sort({"dates.created": 1}).toArray()
    let msgs:Message[] = extractFindData<Message>(data);

    let response:ChatMessagesResponse = {
        messages: maskMessages(currentConversation,msgs)
    }
    return getResponse_Success(response);
}

function maskMessages(conversation:Conversation ,msgs:Message[]) {
    if(conversation.state == ConversationState.Quoted) {
        return msgs.map((msg:Message):Message => {
            if(msg.messageType == MessageType.File) return msg;
            else {
                let textMsg:TextMessage = msg as TextMessage;
                textMsg.text = filterContactData(textMsg.text);
                return textMsg;
            }
        })
    }
    else return msgs;
}

function filterContactData(text:string) {
    //todo mask phonenumbers/email/urls
    return text;
}