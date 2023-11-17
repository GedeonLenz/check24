<script lang="ts">
    import type {Message_File, User} from "$lib/types";
    import {getFileName,getFileExtension} from "$lib/tools/clientTools";
    import MessageImage from "./MessageFile/MessageImage.svelte";
    import {currentUser} from "$lib/chat/user";
    export let message:Message_File;

    let mymessage = $currentUser !== undefined && message.sender.username === $currentUser.username;
    let unread = !mymessage && message.read === false;
</script>
<style>
    .message-file {
        margin-top: 0;
        margin-bottom: 10px;
    }
    .message-file .message-wrapper {
        cursor: pointer;
    }

    .message-file .filename {
        font-size: 17px;
    }

    .message-file .download {
        margin-top: 3px;
    }
    .message-file .download i {
        display: inline;
        font-size: 14px;
        margin-right: 5px;
    }
    .message-file .details-wrapper {
        width: calc(100% - 70px - 10px);
    }
    .message-file .message-wrapper {
        width: 220px;
        height: 80px;
    }
    .message-file .filename {
        font-size: 15px;
        white-space:nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .message-file .icon-wrapper {
        width: 70px;
    }
</style>
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