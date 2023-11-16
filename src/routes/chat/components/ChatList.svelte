<script lang="ts">

    import ChatTopbar from "./ChatList/ChatTopbar.svelte";
    import ChatWrapper from "./ChatList/ChatWrapper.svelte";
    import ChatArchived from "./ChatList/ChatArchived.svelte";
    import LoadingScreen from "./LoadingScreen.svelte";
    import ChatSearch from "./ChatList/ChatSearch.svelte";
    import type {User} from "$lib/types";

    export let currentUser:User;

</script>
{#if chatOpen === true}
    <style>
        @media screen and (max-width: 720px) {
            .chat-list {
                display: none;
            }
        }
    </style>
{/if}
<div class="chat-list">
    <LoadingScreen visible={loadingChatListPanel}></LoadingScreen>
    <ChatTopbar currentUser={currentUser}></ChatTopbar>
    <ChatSearch></ChatSearch>
    <ChatWrapper currentUser={currentUser} conversations={conversations} selectedConversation={selectedConversation}></ChatWrapper>
    <ChatArchived></ChatArchived>
</div>