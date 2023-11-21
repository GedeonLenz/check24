import {get, writable, type Writable} from "svelte/store";
import type {ConversationEntry, Message} from "$lib/types";
import {selectedConversation, updateSelectedConversation} from "$lib/chat/conversations";
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
import {fileValue, loadingChatPanel, messageField, messagePage, sendProgress} from "$lib/chat/states";

export const messages:Writable<Message[]>  = writable([]);

export async function fetchCurrentMessages(invisible:boolean = false, addPage:boolean = false) {
    await fetchMessages(get(selectedConversation),invisible,addPage);
}

const MESSAGES_PER_PAGE:number = 25;

export async function fetchMessages(conversation:ConversationEntry | undefined,invisible:boolean = false, addPage:boolean = false) {
    if(conversation === undefined) return false;
    if(!invisible) loadingChatPanel.set(true);
    let offset = 0;
    let amount = MESSAGES_PER_PAGE;
    if(addPage) {
        offset = MESSAGES_PER_PAGE * get(messagePage);
        amount = MESSAGES_PER_PAGE;
    }
    let res = await getMessages(conversation.conversationObj._id,offset,amount);
    if(res === false || res.status !== 200) {
        error.set('Failed to load conversation!');
    }
    else{
        let newMessages:Message[] = (await res.json()).data.messages;
        let lastPresentMessageID = get(messages).length >= 1 ? get(messages)[get(messages).length-1]._id : undefined;
        let matchingIndex = undefined;
        if(addPage) {
            if(get(messages).length === 0 || (newMessages.length >= 1 && newMessages[0]._id !== get(messages)[0]._id)) {
                messagePage.set(get(messagePage)+1);
                messages.set(newMessages.concat(get(messages)));
            }
        }
        else{
            if (lastPresentMessageID !== undefined) {
                if (newMessages.length >= 1) {
                    for (let i = newMessages.length - 1; i >= 0; i--) {
                        if (newMessages[i]._id === lastPresentMessageID) {
                            matchingIndex = i;
                            break;
                        }
                    }
                    if (matchingIndex !== undefined && (matchingIndex + 1) <= (newMessages.length - 1)) {
                        let append:Message[] = newMessages.slice(matchingIndex + 1, newMessages.length);
                        messages.set(get(messages).concat(append));
                    } else {
                        //no matching message found. inconsistency.
                    }
                } else {
                    //no received messages. do nothing
                }
            } else {
                messages.set(newMessages);
            }
        }
    }
    loadingChatPanel.set(false);
}

export async function acceptOffer() {
    let sc = get(selectedConversation)
    if(sc) {
        sendProgress.set(10);
        let res = await sendAcceptMessage(get(currentUser),sc.conversationObj._id)
        if(res != false && res.status == 200) {
            sendProgress.set(100);
            await updateSelectedConversation();
            await fetchCurrentMessages(true);
        }
        else{
            error.set('An Error occurred while trying to send your message. Please try again later.');
        }
        resetProgressBar();
    }
}

export async function declineOffer() {
    let sc = get(selectedConversation)
    if(sc) {
        sendProgress.set(10);
        let res = await sendRejectMessage(get(currentUser),sc?.conversationObj._id);
        if(res != false && res.status == 200) {
            sendProgress.set(100);
            await updateSelectedConversation();
            await fetchCurrentMessages(true);
        }
        else{
            error.set('An Error occurred while trying to send your message. Please try again later.');
        }
        resetProgressBar();
    }
}
export async function sendTextMessageRequest() {
    if(get(messageField) == "") return;
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
        let res = await sendTextMessage(cu,sc?.conversationObj._id,get(messageField));
        if(res != false && res.status == 200) {
            messageField.set("");
            sendProgress.set(100);
            await updateSelectedConversation();
            await fetchCurrentMessages(true);
        }
        else{
            error.set('An Error occurred while trying to send your message. Please try again later.');
        }
        resetProgressBar();
    }
}

export async function sendFileMessageRequest() {
    let fv = get(fileValue);
    if (fv) {
        let file: File | null = fv.item(0);
        let sc = get(selectedConversation)
        if (sc && file != null) {
            sendProgress.set(2);
            let updateFileProgress = (progress:number) => {
                sendProgress.set(progress*0.8);
            }
            let res = await sendFileMessage(get(currentUser), sc.conversationObj._id, file,updateFileProgress);
            if(res != false) {
                sendProgress.set(100);
                await updateSelectedConversation();
                await fetchCurrentMessages(true);
            } else {
                error.set('An Error occurred while trying to upload you file. Please try again later.');
            }
            resetProgressBar();
        }
    }
}

export function resetProgressBar() {
    let progbar = document.getElementById('sendprogress')
    if(progbar) {
        progbar.style.display = 'none';
        sendProgress.set(0);
        setTimeout(() => {
            (progbar as HTMLElement).style.display = 'block';
        }, 300);
    }
}

export async function checkScrollLoad(event:any) {
    if (event.target.scrollTop === 0) {
        await fetchCurrentMessages(true, true);
    }
}