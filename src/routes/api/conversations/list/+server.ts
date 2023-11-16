/*GET / Filter List of Conversations*/
import {getUser} from "$lib/auth";
import {
    extractFindData, getLastMessage, getPictureURL,
    getResponse_BadRequest,
    getResponse_InternalError,
    getResponse_Success,
    getResponse_Unauthorized, getUnreadCount
} from "$lib/serverTools";
import {collection_conversations} from "$db/collections";
import type {
    Conversation,
    ConversationEntry,
    ConversationListRequest,
    ConversationListResponse,
    Message,
    User
} from "../../types";
import {UserRole} from "../../types";

export async function GET(event:any) {
    let currentUser:User | null = await getUser(event.cookies);
    if(currentUser == null) return getResponse_Unauthorized();

    let url = event.url;
    let query = url.searchParams.get('query') ?? '';
    let offset = Number(url.searchParams.get('offset') ?? '0');
    let amount = Number(url.searchParams.get('amount') ?? '0');

    if(query == '') {
        console.log(amount)
        return getResponse_BadRequest()
    }
    query = JSON.parse(query);

    let request:ConversationListRequest = {
        query:query,
        offset:offset,
        amount:amount
    }

    const userRestrictions = (currentUser.type == UserRole.ServiceProvider) ? {"usernames.serviceprovider": currentUser.username} : {"usernames.customer": currentUser.username};
    const merged = { ...userRestrictions, ...request.query };
    const data = await collection_conversations.find(merged,{skip: request.offset, limit:request.amount, projection: {}}).sort({"dates.updated": -1}).toArray()
    let conversations:Conversation[] = extractFindData<Conversation>(data);

    let conversationEntries:ConversationEntry[] = [];

    for (const conversation of conversations) {
        let lastMessage:Message | null= await getLastMessage(conversation);
        if(lastMessage == null) {
            return getResponse_InternalError();
        }
        let unreadCount:number = await getUnreadCount(conversation,currentUser);
        let pictureURL:string = await getPictureURL(conversation,currentUser);
        conversationEntries.push({conversationObj:conversation,lastMessage: lastMessage, unreadCount:unreadCount,pictureURL:pictureURL});
    }

    const lastOpenedData = await collection_conversations.find(merged,{skip: request.offset, limit:request.amount, projection: {}}).sort({"dates.opened": -1}).limit(1).toArray()
    let lastOpened:Conversation[] = extractFindData<Conversation>(lastOpenedData);

    let lastOpenedEntry = undefined;
    let lastOpenedEntryA:ConversationEntry[] = conversationEntries.filter((entry) => {
        return entry.conversationObj._id === lastOpened[0]._id
    });
    if(lastOpenedEntryA.length >= 1) lastOpenedEntry = lastOpenedEntryA[0];

    let response:ConversationListResponse = {
        conversations: conversationEntries,
        lastOpened: lastOpenedEntry
    }
    return getResponse_Success(response);
}