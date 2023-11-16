<script lang="ts">
    import type {Message_File, User} from "$lib/types";
    import {getFileName,getFileExtension} from "$lib/tools/clientTools";
    import MessageImage from "./MessageFile/MessageImage.svelte";
    import {currentUser} from "$lib/chat/user";
    export let message:Message_File;

    let mymessage = $currentUser !== undefined && message.sender.username === $currentUser.username;
    let unread = !mymessage && message.read === false;
</script>
{#if ['jpg','jpeg','gif','webp','png'].includes(getFileExtension(message.filePath))}
    <MessageImage message={message}></MessageImage>
{:else}
    <div class="chat-message message-file {unread ? 'message-unread' : ''} {mymessage ? 'message-me' : 'message-other'}">
        <a href="{message.filePath}" download>
            <div class="message-wrapper">
                <div class="icon-wrapper">
                    <i class="fa-regular fa-file"></i>
                </div>
                <div class="details-wrapper">
                    <span class="filename">{getFileName(message.filePath)}</span>
                    <span class="download"><i class="fa-solid fa-cloud-arrow-down"></i>Download</span>
                </div>
            </div>
        </a>
    </div>
{/if}