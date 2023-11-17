import {error, resetError, resetSuccess} from "$lib/chat/notifications";
import {archiveMode, chatOpen, loadingChatPanel, noChat, searchQuery} from "$lib/chat/states";
import {conversations, selectedConversation, viewConversations, visibleConversations} from "$lib/chat/conversations";
import {getOtherUsername, openConversation} from "$lib/tools/clientTools";
import {currentUser} from "$lib/chat/user";
import {get} from "svelte/store";
import {UserRole} from "$lib/types";
import {fetchCurrentMessages, fetchMessages} from "$lib/chat/messages";

export async function startAllListeners() {
    startNotificationListener();
    startListenerSearchQuery();
    startListenerViewConversations();
    startListenerArchiveMode();
    startListenerSelectedConversation();
}
async function startListenerSelectedConversation() {
    selectedConversation.subscribe(async (selectedConversation) => {
        if(selectedConversation === undefined) return;
        noChat.set(false);
        chatOpen.set(true)

        await fetchCurrentMessages();
        //Set conversation as opened
        let res = await openConversation(selectedConversation.conversationObj._id);
        if(res == false || res.status != 200) {
            error.set('An Error occurred while trying to update your chat status');
        }
    });
}
async function startNotificationListener() {
    error.subscribe((error) => {
        resetError(error);
    });
    error.subscribe((success) => {
        resetSuccess(success);
    });
}

async function startListenerSearchQuery() {
    searchQuery.subscribe((query) => {
        if(get(searchQuery) == '') visibleConversations.set(get(viewConversations));
        else{
            visibleConversations.set(
                get(viewConversations).filter((entry) => {
                    let otherUsername = getOtherUsername(get(currentUser), entry.conversationObj.usernames);
                    if(otherUsername === undefined) return false;
                    let res = otherUsername.toLowerCase().includes(get(searchQuery).toLowerCase());
                    return res;
                })
            );
        }
    });
}

function startListenerArchiveMode() {
    archiveMode.subscribe((archiveMode) => {
        if(archiveMode) {
            viewConversations.set(
                get(conversations).filter(
                    (conversation) => {
                        let cu = get(currentUser);
                        return cu !== undefined && cu.type == UserRole.ServiceProvider ?
                            conversation.conversationObj.archived?.serviceprovider === true
                            :
                            conversation.conversationObj.archived?.customer === true
                    }
                ));
        }
        else{
            viewConversations.set(get(conversations))
        }
    });
}

function startListenerViewConversations(){
    viewConversations.subscribe((viewConversations) => {
        visibleConversations.set(viewConversations);
        searchQuery.set('');
    });
}