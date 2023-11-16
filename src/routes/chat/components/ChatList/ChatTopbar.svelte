<script lang="ts">
    import {type User, UserRole} from "$lib/types.js";
    import {newChatVisible} from "$lib/chat/states";

    export let currentUser:User;
</script>

<div class="chats-topbar">
    <h2 class="chats-heading">Chats</h2>
    <div class="topbar-button-wrapper">
        <a href="/logout"><i class="fa-solid fa-arrow-right-from-bracket"></i></a>
        {#if currentUser.type === UserRole.ServiceProvider}
            <i id="newchat" role="button"  tabindex="0" on:keydown={() => {newChatVisible.set(true);}} on:click={() => {newChatVisible.set(true);}} class="fa-regular fa-pen-to-square"></i>
        {/if}
    </div>
</div>