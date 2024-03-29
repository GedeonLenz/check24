import {get, writable, type Writable} from "svelte/store";
import type {ConversationEntry, ConversationListResponse, User} from "$lib/types";
import {UserRole} from "$lib/types";
import {
    archiveConversation,
    getConversations,
    getOtherUsername,
    initConversation,
    requestConversationReview,
    reviewConversation
} from "$lib/tools/clientTools";
import {error, success} from "$lib/chat/notifications";
import {fetchCurrentMessages, insertUnreadBanner, markAsRead, messages, sendRead} from "$lib/chat/messages";
import {currentUser} from "$lib/chat/user";
import {
    archiveMode, chatOpen,
    loadingChatList, messagePage,
    newChatVisible,
    noChat,
    quote_price,
    quote_text,
    quote_username,
    searchQuery
} from "$lib/chat/states";

export const selectedConversation:Writable<ConversationEntry | undefined>  = writable(undefined);
export const lastOpenedConversation:Writable<ConversationEntry | undefined>  = writable(undefined);

export const conversations:Writable<ConversationEntry[]>  = writable([]);
export const viewConversations:Writable<ConversationEntry[]>  = writable([]);
export const visibleConversations:Writable<ConversationEntry[]>  = writable([]);


export async function fetchConversations(invisible:boolean = false) {
    if(!invisible) {
        loadingChatList.set(true);
    }
    let conversationData:ConversationListResponse = await getConversations(get(currentUser),get(searchQuery));
    conversations.set(conversationData.conversations);
    lastOpenedConversation.set(conversationData.lastOpened);
    loadingChatList.set(false);
}

export async function initSelectedConversation() {
    let initVal:ConversationEntry | undefined;
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
   await openConversation(initVal);
}

export async function openConversation(newConversation:ConversationEntry | undefined) {
    selectedConversation.set(newConversation);
    if(get(selectedConversation) === undefined) {
        noChat.set(true);
        chatOpen.set(false)
        return;
    }
    else{
        messagePage.set(1);
        noChat.set(false);
        chatOpen.set(true)
        messages.set([]);
        await fetchCurrentMessages();
        let sc = get(selectedConversation);
        if(sc !== undefined && sc.unreadCount <= 0) {
            markAsRead()
        }
        insertUnreadBanner(true);
        sendRead();
    }
}
export async function updateSelectedConversation() {
    await fetchConversations(true);
    let updateVal:ConversationEntry | undefined = undefined;
    let newElements = get(conversations).filter((entry) => {
        let sc = get(selectedConversation);
        if(sc === undefined) {
            return false;
        }
        return entry.conversationObj._id === (sc as ConversationEntry).conversationObj._id;
    });

    if(newElements.length >= 1) {
        updateVal = newElements[0];
    }
    if(updateVal !== undefined) {
        selectedConversation.set(updateVal);
    }
}

export async function sendQuote() {
    let res = await initConversation(get(currentUser),get(quote_username),get(quote_text),get(quote_price));
    newChatVisible.set(false);
    if(res == false || res.status != 200) {
        error.set('An Error occurred while trying to send your quote. Please try again later.');
    }
    else {
        success.set("Your quote has been sent.");
        let newEntry = await res.json();
        await fetchConversations();
        await openConversation(newEntry.data.conversation);
    }
    quote_username.set('');
    quote_price.set(0);
    quote_text.set('');
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
            await openConversation(undefined);
            await fetchConversations(true);
        }
    }
}

export async function applyConversationFilterArchive(conversations:ConversationEntry[]) {
    if(get(archiveMode)) {
        return conversations.filter(
            (conversation) => {
                let cu = get(currentUser);
                return cu !== undefined && cu.type == UserRole.ServiceProvider ?
                    conversation.conversationObj.archived?.serviceprovider === true
                    :
                    conversation.conversationObj.archived?.customer === true
            }
        );
    }
    else{
        return conversations.filter(
            (conversation) => {
                let cu = get(currentUser);
                return cu !== undefined && cu.type == UserRole.ServiceProvider ?
                    conversation.conversationObj.archived?.serviceprovider !== true
                    :
                    conversation.conversationObj.archived?.customer !== true
            }
        );
    }
}

export async function applyConversationFilterSearch(conversations:ConversationEntry[]) {
    let sq:string = get(searchQuery).toLowerCase();
    let cu:User | undefined = get(currentUser);
    if(sq != '') {
        return conversations.filter((entry:ConversationEntry) => {
            let otherUsername:string |undefined = getOtherUsername(cu,entry.conversationObj.usernames)
            if (otherUsername == undefined) {
                return false;
            }
            return otherUsername.toLowerCase().includes(sq);
        });
    } else {
        return conversations;
    }
}

export async function requestReview() {
    let sc = get(selectedConversation);
    if(sc !== undefined) {
        let res = await requestConversationReview(sc.conversationObj._id);
        if(res != false && res.status == 200) {
            success.set('Review requested');
            await updateSelectedConversation();
            await fetchCurrentMessages(true);
        }
        else{
            error.set('An Error occurred while trying to request a review. Please try again later.');
        }
    }
}

export async function sendReview(rating:number) {
    let sc = get(selectedConversation);
    if(sc !== undefined) {
        let res = await reviewConversation(sc.conversationObj._id,rating);
        if(res != false && res.status == 200) {
            success.set('Review sent');
            await updateSelectedConversation();
            await fetchCurrentMessages(true);
        }
        else{
            error.set('An Error occurred while trying to send your review. Please try again later.');
        }
    }
}