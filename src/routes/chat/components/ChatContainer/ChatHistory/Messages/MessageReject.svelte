<script lang="ts">
    import type {Message_Reject, User} from "$lib/types";
    export let message:Message_Reject;

    let mymessage = $currentUser !== undefined && message.sender.username === $currentUser.username;
    let unread = !mymessage && message.read === false;
</script>
<div class="chat-message message-decline {unread ? 'message-unread' : ''} {mymessage ? 'message-me' : 'message-other'}">
    <div class="message-wrapper">
        <div class="icon-wrapper">
            <i class="fa-regular fa-circle-xmark"></i>
        </div>
        <div class="details-wrapper">
            <span class="heading">Declined</span>
            <span class="status">The quote has been declined</span>
        </div>
    </div>
</div>