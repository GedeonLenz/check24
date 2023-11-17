import {writable, type Writable} from "svelte/store";
import {updateSelectedConversation} from "$lib/chat/conversations";
import {fetchCurrentMessages} from "$lib/chat/messages";

export const schedulaerChatList:Writable<NodeJS.Timeout | null>  = writable(null);
export const schedulaerChatMessages:Writable<NodeJS.Timeout | null>  = writable(null);

export async function startAllSchedulers() {
    //await startChatListUpdater();
    //await startChatMessageUpdater();
}

const delay = 15*1000;
export async function startChatListUpdater() {
    let scheduler = setInterval(async () => {
        await updateSelectedConversation();
    }, delay);
    schedulaerChatList.set(scheduler);
}

export async function startChatMessageUpdater() {
    let scheduler = setInterval(async () => {
        await fetchCurrentMessages(true);
    }, delay);
    schedulaerChatMessages.set(scheduler);
}