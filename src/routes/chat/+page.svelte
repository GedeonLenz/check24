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
    export let data;
    currentUser.set(data.currentUser);
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