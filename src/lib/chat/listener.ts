import {error, resetError, resetSuccess} from "$lib/chat/notifications";
import {archiveMode, searchQuery} from "$lib/chat/states";
import {conversations, viewConversations, visibleConversations} from "$lib/chat/conversations";
import {getOtherUsername} from "$lib/tools/clientTools";
import {currentUser} from "$lib/chat/user";
import {get} from "svelte/store";
import {UserRole} from "$lib/types";

export async function startAllListeners() {
    startNotificationListener();
    startListenerSearchQuery();
    startListenerViewConversations();
    startListenerArchiveMode();
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