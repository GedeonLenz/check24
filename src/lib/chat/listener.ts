import {error, resetError, resetSuccess, success} from "$lib/chat/notifications";
import {
    archiveMode,
    searchQuery
} from "$lib/chat/states";
import {
    applyConversationFilterArchive, applyConversationFilterSearch,
    conversations,
    viewConversations,
    visibleConversations
} from "$lib/chat/conversations";
import {get} from "svelte/store";

export async function startAllListeners() {
    await startNotificationListener();
    await startListenerArchiveMode();
    await startListenerSearchQuery();
    await startListenerConversations();
    await startListenerViewConversations();
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