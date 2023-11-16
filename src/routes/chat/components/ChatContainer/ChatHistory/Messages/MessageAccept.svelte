<script lang="ts">
    import type {Message_Accept, Message_Standard, User} from "$lib/types";
    export let currentUser:User;
    export let message:Message_Accept;

    let mymessage = message.sender.username === currentUser.username;
    let unread = !mymessage && message.read === false;
</script>
<div class="chat-message message-accept {unread ? 'message-unread' : ''} {mymessage ? 'message-me' : 'message-other'}">
    <div class="message-wrapper">
        <div class="icon-wrapper">
            <i class="fa-regular fa-circle-check"></i>
        </div>
        <div class="details-wrapper">
            <span class="heading">Accepted</span>
            <span class="status">The quote has been accepted</span>
        </div>
    </div>
</div>