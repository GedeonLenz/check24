<script lang="ts">
    import type {Message_Standard, User} from "$lib/types";
    import {currentUser} from "$lib/chat/user";

    export let message:Message_Standard;

    let mymessage = $currentUser !== undefined && message.sender.username === $currentUser.username;
    let unread = !mymessage && message.read === false;
</script>
<div class="chat-message {unread ? 'message-unread' : ''} {mymessage ? 'message-me' : 'message-other'}">
    <div class="message-wrapper">{message.text}</div>
</div>