<script lang="ts">

import ChatEntry from "./ChatWrapper/ChatEntry.svelte";
import type {ConversationEntry, User} from "$lib/types";
import {getConversations, openConversation} from "$lib/tools/clientTools";
export let currentUser:User;
export let conversations:ConversationEntry[];
export let selectedConversation:ConversationEntry | undefined;

let noChat = false;

async function fetchData() {
    await renderConversationList(true);
    loadingChatListPanel = false;
    lastOpenedConversation = conversationData.lastOpened;
    let firstSelection = getSelectedConversation();
    if(firstSelection != undefined) await openConversationEntry(getSelectedConversation() as ConversationEntry,true);
    JOB_updateCourseList = setInterval(() => {renderConversationList(false)}, 15000);
}
async function renderConversationList(runArchive:boolean = false) {
    noChat = selectedConversation == undefined;
    conversationData = await getConversations(currentUser,searchQuery);
    //Archive filter
    if(runArchive) setArchiveMode(archiveMode);
    //Search filter
    visibleConversations = viewConversations;
    await applySearch();
}
async function openConversationEntry(newConversation:ConversationEntry,isAutomatic = false) {
    selectedConversation = newConversation;
    noChat = false;
    loadingChatPanel = true;
    if(!isAutomatic) chatOpen = true;
    //Load conversation
    await loadMessages();
    if(JOB_updateMessages == undefined) JOB_updateMessages = setInterval(loadMessages, 15000);
    //Set conversation as opened
    let res = await openConversation(selectedConversation.conversationObj._id);
    if(res == false || res.status != 200) {
        showError('An Error occurred while trying to update your chat status');
    }
    insertUnreadBanner();
    scrollChat();
    loadingChatPanel = false;
}

function getSelectedConversation() {
    if(lastOpenedConversation !== undefined) {
        let isContained = viewConversations.filter((entry) => {
            return entry.conversationObj._id === (lastOpenedConversation as ConversationEntry).conversationObj._id;
        }).length >= 1;
        if(isContained) {
            return lastOpenedConversation
        }
        else{
            let res = viewConversations.length >= 1 ? viewConversations[0] : undefined;
            if(res == undefined) noChat = true
            return res;
        }
    }
}
</script>

<div class="chat-wrapper">
    <div class="chat-wrapper-content">
        {#each conversations as conversation}
            <ChatEntry currentUser={currentUser} conversation={conversation} selectedConversation={selectedConversation}></ChatEntry>
        {/each}
    </div>
</div>