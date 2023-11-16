/*GET / Filter List of Conversations*/
import {collection_messages} from "$db/collections";
import {getUser} from "$lib/auth";
import {
    extractFindData,
    getConversation,
    getResponse_BadRequest,
    getResponse_Success,
    getResponse_Unauthorized,
    isUserConversationParticipant
} from "$lib/tools/serverTools";
import type {ChatMessagesRequest, ChatMessagesResponse, Conversation, Message, TextMessage} from "$lib/types";
import {ConversationState, MessageType} from "$lib/types";

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
    if(conversation.state == ConversationState.Quoted || conversation.state == ConversationState.Chatting) {
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
    text = maskEmail(text);
    text = maskURLs(text);
    text = maskPhone(text);
    return text;
}

function maskURLs(input:string) {
    const domainRegex: RegExp = /(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}/g;
    input = input.replace(domainRegex, (m:string) => '*'.repeat(m.length));
    return input
}

function maskPhone(input:string) {
    const phoneRegex: RegExp = /(\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*)/g;
    input = input.replace(phoneRegex, (match:string) => match.replace(/\d/g, '*'));
    return input
}

function maskEmail(input:string) {
    const emailRegex: RegExp = /(?<=\w*)[\w\-._+%]*(?=\w*@)/g;
    input = input.replace(emailRegex, (m: string) => '*'.repeat(m.length));
    return input
}