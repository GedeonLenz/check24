<script lang="ts">
    import type {Message_File, User} from "$lib/types.js";
    import {currentUser} from "$lib/chat/user";

    export let message:Message_File;

    let mymessage = $currentUser !== undefined && message.sender.username === $currentUser.username;
    let unread = !mymessage && message.read === false;
</script>
<style>
    .message-image .message-wrapper {
        width: 350px;
        height: 200px;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 5px 5px 40px 0 rgba(0,0,0,0.12);
        cursor: zoom-in;
        padding: 0;
        background: #fcfcfc;
    }
    .message-image img {
        border-radius: 12px;
        width: 350px;
        height: 200px;
        position: relative;
        object-fit: cover;
        object-position: center;
    }
</style>
<div class="chat-message message-image {unread ? 'message-unread' : ''} {mymessage ? 'message-me' : 'message-other'}">
    <a href="{message.filePath}" target="_blank">
        <div class="message-wrapper">
            <img src="{message.filePath}" alt="message">
        </div>
    </a>
</div>