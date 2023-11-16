<script lang="ts">
    import type {Message_File, User} from "$lib/types.js";

    export let message:Message_File;
    export let currentUser:User;

    let mymessage = message.sender.username === currentUser.username;
    let unread = !mymessage && message.read === false;
</script>

<div class="chat-message message-image {unread ? 'message-unread' : ''} {mymessage ? 'message-me' : 'message-other'}">
    <a href="{message.filePath}" target="_blank">
        <div class="message-wrapper">
            <img src="{message.filePath}" alt="message">
        </div>
    </a>
</div>