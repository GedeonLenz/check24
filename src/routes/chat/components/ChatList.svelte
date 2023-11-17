<script lang="ts">
    import ChatTopbar from "./ChatList/ChatTopbar.svelte";
    import ChatWrapper from "./ChatList/ChatWrapper.svelte";
    import ChatArchived from "./ChatList/ChatArchived.svelte";
    import LoadingScreen from "./LoadingScreen.svelte";
    import ChatSearch from "./ChatList/ChatSearch.svelte";
    import {chatOpen, loadingChatList} from "$lib/chat/states";
    import {fetchConversations} from "$lib/chat/conversations";
</script>
{#if $chatOpen === true}
    <style>
        @media screen and (max-width: 720px) {
            .chat-list {
                display: none;
            }
        }
    </style>
{/if}
<div class="chat-list">
    <LoadingScreen visible={$loadingChatList}></LoadingScreen>
    <ChatTopbar></ChatTopbar>
    <ChatSearch></ChatSearch>
    <ChatWrapper></ChatWrapper>
    <ChatArchived></ChatArchived>
</div>