<script lang="ts">
    import {UserRole} from "$lib/types.js";
    import {newChatVisible} from "$lib/chat/states";
    import {currentUser} from "$lib/chat/user";
</script>
<style>
    .chats-topbar {
        display: block;
        position: relative;
        padding: 15px 15px 10px;
        width: calc(100% - 30px);
    }
    .topbar-button-wrapper {
        display: inline-block;
        position: absolute;
        height: 30px;
        right: 15px;
        box-sizing: border-box;
        vertical-align: top;
    }
    .topbar-button-wrapper i {
        display: inline-block;
        position: relative;
        top:50%;
        transform: translateY(-50%);
        cursor: pointer;
        font-size: 16px;
        margin-left: 10px;
    }
    .chats-heading {
        display: inline-block;
        position: relative;
        text-align: left;
        font-family: "Helvetica Neue","Arial",sans-serif;
        font-size: 25px;
        font-weight: 600;
        color:#3b3b3b;
        margin: 0;
        vertical-align: middle;
    }
</style>
<div class="chats-topbar">
    <h2 class="chats-heading">Chats</h2>
    <div class="topbar-button-wrapper">
        <i on:click={() => {currentUser.set(undefined); window.location.href='/logout';}} on:keypress={()=>{}} role="button" tabindex="0" class="fa-solid fa-arrow-right-from-bracket"></i>
        {#if $currentUser !== undefined && $currentUser.type === UserRole.ServiceProvider}
            <i id="newchat" role="button"  tabindex="0" on:keydown={() => {newChatVisible.set(true);}} on:click={() => {newChatVisible.set(true);}} class="fa-regular fa-pen-to-square"></i>
        {/if}
    </div>
</div>