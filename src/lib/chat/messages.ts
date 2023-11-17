import {get, writable, type Writable} from "svelte/store";
import type {ConversationEntry, Message} from "$lib/types";
import {selectedConversation} from "$lib/chat/conversations";
import {
    getMessages,
    sendAcceptMessage,
    sendFileMessage,
    sendRejectMessage,
    sendTextMessage
} from "$lib/tools/clientTools";
import {currentUser} from "$lib/chat/user";
import {error} from "$lib/chat/notifications";
import {ConversationState, UserRole} from "$lib/types";
import {loadingChatPanel, sendProgress} from "$lib/chat/states";

export const messages:Writable<Message[]>  = writable([]);

export async function fetchCurrentMessages(invisible:boolean = false) {
    await fetchMessages(get(selectedConversation),invisible);
}
export async function fetchMessages(conversation:ConversationEntry | undefined,invisible:boolean = false) {
    if(conversation === undefined) return false;
    if(!invisible) loadingChatPanel.set(true);
    let res = await getMessages(conversation.conversationObj._id);
    if(res === false || res.status !== 200) {
        error.set('Failed to load conversation!');
    }
    else{
        messages.set((await res.json()).data.messages);
    }
    loadingChatPanel.set(false);
}


export async function acceptOffer() {
    let sc = get(selectedConversation)
    if(sc) {
        sendProgress.set(10);
        let res = await sendAcceptMessage(get(currentUser),sc.conversationObj._id)
        sendProgress.set(80);
        if(res != false && res.status == 200) {
            fetchCurrentMessages();
        }
        else{
            error.set('An Error occurred while trying to send your message. Please try again later.');
        }
        sendProgress.set(100);
        setTimeout(() => {
            resetProgressBar();
        }, 500);
    }
}

export async function declineOffer() {
    let sc = get(selectedConversation)
    if(sc) {
        sendProgress.set(10);
        let res = await sendRejectMessage(get(currentUser),sc?.conversationObj._id);
        sendProgress.set(80);
        if(res != false && res.status == 200) {
            fetchCurrentMessages();
        }
        else{
            error.set('An Error occurred while trying to send your message. Please try again later.');
        }
        sendProgress.set(100);
        setTimeout(() => {
            resetProgressBar();
        }, 500);
    }
}

async function sendFileMessageRequest(fileValue: FileList | null) {
    if (fileValue) {
        let file: File | null = fileValue.item(0);
        let sc = get(selectedConversation)
        if (sc && file != null) {
            sendProgress.set(2);
            let updateFileProgress = (progress:number) => {
                sendProgress.set(progress*0.8);
            }
            let res = await sendFileMessage(get(currentUser), sc.conversationObj._id, file,updateFileProgress);
            if(res != false) {
                sendProgress.set(95);
                fetchCurrentMessages();
                sendProgress.set(100);
            } else {
                error.set('An Error occurred while trying to upload you file. Please try again later.');
            }
            resetProgressBar();
        }
    }
}

let messageField = "";
async function sendTextMessageRequest() {
    if(messageField == "") return;
    let cu = get(currentUser);
    let sc = get(selectedConversation)
    if(
        cu !== undefined &&
        cu.type === UserRole.ServiceProvider &&
        sc !== undefined &&
        (
            sc.conversationObj.state === ConversationState.Quoted ||
            sc.conversationObj.state === ConversationState.Rejected
        )) {
        return;
    }
    if(sc) {
        sendProgress.set(10);
        let res = await sendTextMessage(cu,sc?.conversationObj._id,messageField);
        sendProgress.set(80);
        if(res != false && res.status == 200) {
            fetchCurrentMessages()
        }
        else{
            error.set('An Error occurred while trying to send your message. Please try again later.');
        }
        messageField = "";
        sendProgress.set(100);
        setTimeout(() => {
            resetProgressBar();
        }, 500);
    }
}

function resetProgressBar() {
    let progbar = document.getElementById('sendprogress')
    if(progbar) {
        progbar.style.display = 'none';
        sendProgress.set(0);
        setTimeout(() => {
            (progbar as HTMLElement).style.display = 'block';
        }, 300);
    }
}

function insertUnreadBanner() {
    const container = document.getElementById('chat-history-content');
    if(container == null) return;
    const prevBanner = container.querySelector('.unread-banner');
    if(prevBanner){

        if(prevBanner.classList.contains('first-message')) {
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = '<div id="top-placeholder"></div>'
            container.insertBefore(tempContainer.firstChild as ChildNode, prevBanner);
        }
        prevBanner.remove();
    }
    const firstUnreadElement = container.querySelector('.message-unread');
    if (firstUnreadElement) {
        const groupElements = document.querySelectorAll('.chat-message');
        const isFirstMessage = Array.from(groupElements).indexOf(firstUnreadElement as Element) === 0;

        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = '<div class="chat-message unread-banner" id="unread-banner"><span>Unread messages</span></div>'
        if(isFirstMessage) tempContainer.innerHTML = '<div class="chat-message unread-banner first-message"><span>Unread messages</span></div>'
        container.insertBefore(tempContainer.firstChild as ChildNode, firstUnreadElement);

        if (isFirstMessage) {
            let placeholder = document.getElementById('top-placeholder')
            if(placeholder) placeholder.remove();
        }
    }
}