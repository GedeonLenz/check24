import {get, writable, type Writable} from "svelte/store";
import {updateSelectedConversation} from "$lib/chat/conversations";
import {fetchCurrentMessages} from "$lib/chat/messages";
import {currentUser} from "$lib/chat/user";

export const schedulaerChatList:Writable<NodeJS.Timeout | null>  = writable(null);
export const schedulaerChatMessages:Writable<NodeJS.Timeout | null>  = writable(null);

export async function startAllSchedulers() {
    await startChatListUpdater();
    await startChatMessageUpdater();
}

const delay = 5*1000;
export async function startChatListUpdater() {
    let scheduler = setInterval(async () => {
        if(get(currentUser) === undefined) {
            return;
        }
        await updateSelectedConversation();
    }, delay);
    schedulaerChatList.set(scheduler);
}

export async function startChatMessageUpdater() {
    let scheduler = setInterval(async () => {
        if(get(currentUser) === undefined) {
            return;
        }
        await fetchCurrentMessages(true);
    }, delay);
    schedulaerChatMessages.set(scheduler);
}