<svelte:head>
    <title>Chats</title>
</svelte:head>
<script lang="ts">
    import type {
        ConversationEntry,
        ConversationListResponse,
        User
    } from "$lib/types";
    import {onMount} from "svelte";
    import '@fortawesome/fontawesome-free/css/all.min.css'
    import ChatContainer from "./components/ChatContainer.svelte";
    import NewChat from "./components/NewChat.svelte";
    import Notifications from "./components/Notifications.svelte";
    import ChatList from "./components/ChatList.svelte";

    export let data;
    let currentUser:User = data.currentUser;
</script>
<style>
    @import './style.css';
</style>
<div class="page-chats">
    <Notifications></Notifications>
    <NewChat></NewChat>
    <ChatList currentUser={currentUser}></ChatList>
    <ChatContainer currentUser={currentUser}></ChatContainer>
</div>