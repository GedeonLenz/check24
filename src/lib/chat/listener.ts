import {error, resetError, resetSuccess, success} from "$lib/chat/notifications";
import {
    archiveMode,
    chatOpen,
    messagePage,
    noChat,
    noSelectTrigger,
    searchQuery
} from "$lib/chat/states";
import {
    applyConversationFilterArchive, applyConversationFilterSearch,
    conversations,
    selectedConversation,
    viewConversations,
    visibleConversations
} from "$lib/chat/conversations";
import {openConversation} from "$lib/tools/clientTools";
import {get} from "svelte/store";
import {fetchCurrentMessages, insertUnreadBanner, markAsRead} from "$lib/chat/messages";

export async function startAllListeners() {
    await startNotificationListener();
    await startListenerArchiveMode();
    await startListenerSearchQuery();
    await startListenerSelectedConversation();
    await startListenerConversations();
    await startListenerViewConversations();
}
async function startListenerSelectedConversation() {
    selectedConversation.subscribe(async (selectedConversation) => {
        if(get(noSelectTrigger)) {
            noSelectTrigger.set(false);
            return;
        }
        if(selectedConversation === undefined) {
            noChat.set(true);
            chatOpen.set(false)
            return;
        }
        else{
            messagePage.set(1);
            noChat.set(false);
            chatOpen.set(true)
            await fetchCurrentMessages();
            insertUnreadBanner();
            let res = await openConversation(selectedConversation.conversationObj._id);
            if(res == false || res.status != 200) {
                error.set('An Error occurred while trying to update your chat status');
            }
            else{
                markAsRead();
            }
        }
    });
}

async function startListenerConversations() {
    conversations.subscribe(async (conversations) => {
        viewConversations.set(await applyConversationFilterArchive(conversations));
        visibleConversations.set(await applyConversationFilterSearch(get(viewConversations)));
    });
}
async function startNotificationListener() {
    error.subscribe((error) => {
        resetError(error);
    });
    success.subscribe((success) => {
        resetSuccess(success);
    });
}

async function startListenerSearchQuery() {
    searchQuery.subscribe(async () => {
        visibleConversations.set(await applyConversationFilterSearch(get(viewConversations)));
    });
}

async function startListenerArchiveMode() {
    archiveMode.subscribe(async () => {
        viewConversations.set(await applyConversationFilterArchive(get(conversations)));
    });
}

async function startListenerViewConversations() {
    viewConversations.subscribe(async () => {
        visibleConversations.set(await applyConversationFilterSearch(get(viewConversations)));
    });
}