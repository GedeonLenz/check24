<script lang="ts">
import ChatProfile from "./ChatContainer/ChatProfile.svelte";
import ChatEditor from "./ChatContainer/ChatEditor.svelte";
import LoadingScreen from "./LoadingScreen.svelte";
import ChatHistory from "./ChatContainer/ChatHistory.svelte";
import NoChat from "./ChatContainer/NoChat.svelte";
import {chatOpen, loadingChatPanel} from "$lib/chat/states";
import {fetchCurrentMessages} from "$lib/chat/messages";
</script>
{#if $chatOpen === true}
    <style>
        @media screen and (max-width: 720px) {
            .chat-container {
                display: block;
                width: 100%;
                left:0;
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