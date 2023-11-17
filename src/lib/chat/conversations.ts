import {get, writable, type Writable} from "svelte/store";
import type {ConversationEntry, ConversationListResponse} from "$lib/types";
import {archiveConversation, getConversations} from "$lib/tools/clientTools";
import {error, success} from "$lib/chat/notifications";
import {fetchCurrentMessages} from "$lib/chat/messages";
import {currentUser} from "$lib/chat/user";
import {loadingChatList, noChat, searchQuery} from "$lib/chat/states";

export const selectedConversation:Writable<ConversationEntry | undefined>  = writable(undefined);
export const lastOpenedConversation:Writable<ConversationEntry | undefined>  = writable(undefined);

export const conversations:Writable<ConversationEntry[]>  = writable([]);
export const viewConversations:Writable<ConversationEntry[]>  = writable([]);
export const visibleConversations:Writable<ConversationEntry[]>  = writable([]);


export async function fetchConversations(invisible:boolean = false) {
    if(!invisible) loadingChatList.set(true);
    let conversationData:ConversationListResponse = await getConversations(get(currentUser),get(searchQuery));
    conversations.set(conversationData.conversations);
    lastOpenedConversation.set(conversationData.lastOpened);
    loadingChatList.set(false);
}

export async function initSelectedConversation() {
    let initVal:ConversationEntry | undefined = undefined;
    let isContained:boolean = get(viewConversations).filter((entry) => {
        return entry.conversationObj._id === (get(lastOpenedConversation) as ConversationEntry).conversationObj._id;
    }).length >= 1;

    if(isContained) {
        initVal = get(lastOpenedConversation)
    }
    else{
        initVal = get(viewConversations).length >= 1 ? get(viewConversations)[0] : undefined;
    }
    if(initVal == undefined) noChat.set(true);
    selectedConversation.set(initVal);
}

export async function sendQuote(username:string,price:number,text:string) {
    await fetchConversations();
}

export async function archiveChat() {
    let sc = get(selectedConversation);
    if(sc !== undefined){
        let res = await archiveConversation(sc.conversationObj._id);
        if(res == false || res.status != 200) {
            error.set('An Error occurred while trying to archive your chat. Please try again later.');
        }
        else{
            success.set('Chat archived');
            selectedConversation.set(undefined)
            await fetchConversations();
        }
    }
}