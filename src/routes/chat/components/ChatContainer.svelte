<script lang="ts">
import ChatProfile from "./ChatContainer/ChatProfile.svelte";
import ChatEditor from "./ChatContainer/ChatEditor.svelte";
import LoadingScreen from "./LoadingScreen.svelte";
import ChatHistory from "./ChatContainer/ChatHistory.svelte";
import NoChat from "./ChatContainer/NoChat.svelte";
import type {Message, ConversationEntry, User} from "$lib/types";

export let currentUser:User;

let JOB_updateMessages:any = undefined;
</script>
{#if chatOpen === true}
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
    <LoadingScreen visible={loading}></LoadingScreen>
    <NoChat visible={noChat}></NoChat>
    <ChatProfile currentUser={currentUser} selectedConversation={selectedConversation} chatOpen={chatOpen}></ChatProfile>
    <ChatHistory currentUser={currentUser} selectedConversation={selectedConversation} messages={messages}></ChatHistory>
    <ChatEditor currentUser={currentUser} selectedConversation={selectedConversation}></ChatEditor>
</div>