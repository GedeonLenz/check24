<script lang="ts">

import ChatEntry from "./ChatWrapper/ChatEntry.svelte";
import {
    conversations, visibleConversations,
} from "$lib/chat/conversations";
</script>
<style>
    .chat-wrapper {
        display: block;
        position: relative;
        width: 100%;
        height: calc(100% - 158px);
        overflow-x: hidden;
        overflow-y: hidden;
        box-sizing: border-box;
    }
    .chat-wrapper-content {
        display: block;
        position: relative;
        width: 100%;
        height: 100%;
        overflow-x: hidden;
        overflow-y: auto;
        padding-left: 15px;
        padding-right: 15px;
        box-sizing: border-box;
    }
</style>
<div class="chat-wrapper">
    <div class="chat-wrapper-content">
        {#each $visibleConversations as conversation}
            <ChatEntry conversation={conversation}></ChatEntry>
        {/each}
    </div>
</div>