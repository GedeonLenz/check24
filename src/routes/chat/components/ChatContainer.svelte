<script lang="ts">
import ChatProfile from "./ChatContainer/ChatProfile.svelte";
import ChatEditor from "./ChatContainer/ChatEditor.svelte";
import LoadingScreen from "./LoadingScreen.svelte";
import ChatHistory from "./ChatContainer/ChatHistory.svelte";
import NoChat from "./ChatContainer/NoChat.svelte";
import {chatOpen, loadingChatPanel} from "$lib/chat/states";
</script>
<style>
    .chat-container {
        display: inline-block;
        position: absolute;
        left: var(--chat-list-width);
        width: calc(100% - var(--chat-list-width));
        height: 100%;
        overflow: visible;
        transition: 0.3s;
    }

    @media screen and (max-width: 720px) {
        .chat-container {
            display: none;
        }
    }
</style>
{#if $chatOpen === true}
    <style>
        @media screen and (max-width: 720px) {
            .chat-container {
                display: block !important;
                width: 100% !important;
                left:0 !important;
            }
        }
    </style>
{/if}
<div class="chat-container">
    <LoadingScreen visible={$loadingChatPanel}></LoadingScreen>
    <NoChat></NoChat>
    <ChatProfile></ChatProfile>
    <ChatHistory></ChatHistory>
    <ChatEditor></ChatEditor>
</div>