<svelte:head>
    <title>Chats</title>
</svelte:head>
<script lang="ts">
    import '@fortawesome/fontawesome-free/css/all.min.css';
    import ChatList from "./components/ChatList.svelte";
    import ChatContainer from "./components/ChatContainer.svelte";
    import NewChat from "./components/NewChat.svelte";
    import Notifications from "./components/Notifications.svelte";
    import {currentUser} from "$lib/chat/user";
    import {startAllListeners} from "$lib/chat/listener";
    import {fetchConversations, initSelectedConversation} from "$lib/chat/conversations";
    import {onMount} from "svelte";
    export let data;
    currentUser.set(data.currentUser);

    async function init() {
        await startAllListeners();
        await fetchConversations();
        await initSelectedConversation();
    }

    onMount(async () => {
        await init();
    });
</script>
<style>
    @import './style.css';
</style>
<div class="page-chats">
    <Notifications></Notifications>
    <NewChat></NewChat>
    <ChatList></ChatList>
    <ChatContainer></ChatContainer>
</div>