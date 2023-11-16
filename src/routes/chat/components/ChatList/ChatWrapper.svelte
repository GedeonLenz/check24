<script lang="ts">

import ChatEntry from "./ChatWrapper/ChatEntry.svelte";
import type {ConversationEntry, User} from "$lib/types";
import {getConversations, openConversation} from "$lib/tools/clientTools";
import {archiveMode, chatOpen, loadingChatList, loadingChatPanel, noChat, searchQuery} from "$lib/chat/states";
import {
    conversations,
    lastOpenedConversation,
    selectedConversation,
    viewConversations,
    visibleConversations
} from "$lib/chat/conversations";
import {currentUser} from "$lib/chat/user";
import {JOB_updateConversationList} from "$lib/chat/scheduler";


async function fetchData() {
    await renderConversationList(true);
    loadingChatList.set(false);
    let firstSelection = getSelectedConversation();
    if(firstSelection != undefined) selectedConversation.set(getSelectedConversation() as ConversationEntry);
    else noChat.set(true);
    registerJobUpdateConversationList();
}
async function registerJobUpdateConversationList() {
    let ref = setInterval(() => {renderConversationList(false)}, 15000);
    JOB_updateConversationList.set(ref);
}

async function renderConversationList(runArchive:boolean = false) {
    noChat.set($selectedConversation == undefined);
    let conversationData = await getConversations($currentUser, $searchQuery);
    conversations.set(conversationData.conversations);
    lastOpenedConversation.set(conversationData.lastOpened);
    //Archive filter
    archiveMode.set(runArchive);
    //Search filter
    visibleConversations.set($viewConversations);
    await applySearch();
}
async function startConversationOpenListener() {
    selectedConversation.subscribe(async (newConversation:ConversationEntry) => {
        noChat.set(false);
        loadingChatPanel.set(true);
        chatOpen.set(true);
        //Load conversation
        await loadMessages();
        if(JOB_updateMessages == undefined) JOB_updateMessages = setInterval(loadMessages, 15000);
        //Set conversation as opened
        let res = await openConversation($selectedConversation.conversationObj._id);
        if(res == false || res.status != 200) {
            showError('An Error occurred while trying to update your chat status');
        }
        loadingChatPanel.set(false);
    });
}

function getSelectedConversation() {
    if($lastOpenedConversation !== undefined) {
        let isContained = $viewConversations.filter((entry) => {
            return entry.conversationObj._id === ($lastOpenedConversation as ConversationEntry).conversationObj._id;
        }).length >= 1;
        if(isContained) {
            return $lastOpenedConversation
        }
        else{
            let res = $viewConversations.length >= 1 ? $viewConversations[0] : undefined;
            if(res == undefined) noChat.set(true);
            return res;
        }
    }
}
</script>

<div class="chat-wrapper">
    <div class="chat-wrapper-content">
        {#each $conversations as conversation}
            <ChatEntry conversation={conversation}></ChatEntry>
        {/each}
    </div>
</div>