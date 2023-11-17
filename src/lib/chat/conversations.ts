import {get, writable, type Writable} from "svelte/store";
import type {ConversationEntry} from "$lib/types";
import {archiveConversation} from "$lib/tools/clientTools";
import {error, success} from "$lib/chat/notifications";
import {fetchCurrentMessages} from "$lib/chat/messages";

export const selectedConversation:Writable<ConversationEntry | undefined>  = writable(undefined);
export const lastOpenedConversation:Writable<ConversationEntry | undefined>  = writable(undefined);

export const conversations:Writable<ConversationEntry[]>  = writable([]);
export const viewConversations:Writable<ConversationEntry[]>  = writable([]);
export const visibleConversations:Writable<ConversationEntry[]>  = writable([]);


export function fetchConversations() {

    fetchCurrentMessages();
}

export async function sendQuote(username:string,price:number,text:string) {

    fetchConversations();
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
            fetchConversations();
        }
    }
}