<script lang="ts">
    import {ConversationState, UserRole} from "$lib/types.js";
    import {selectedConversation} from "$lib/chat/conversations";
    import {currentUser} from "$lib/chat/user";
    import {fileValue, messageField, sendProgress} from "$lib/chat/states";
    import {sendFileMessageRequest, sendTextMessageRequest} from "$lib/chat/messages";
</script>
<style>
    .chat-editor {
        display: block;
        position: absolute;
        width: 100%;
        left: 0;
        bottom: 0;
        height: 50px;
        border-top: 1px solid rgba(0,0,0,0.1);
    }

    .chat-editor .icon-wrapper {
        display: inline-block;
        position: relative;
        width: 30px;
        height: 30px;
        vertical-align: top;
        left: 20px;
        border-radius: 100px;
        background: #e7e7e7;
        cursor: pointer;
        margin-left: 5px;
        margin-right: 30px;
        margin-top: 10px;
        margin-bottom: 10px;
    }
    .chat-editor .icon-wrapper i{
        display: block;
        position: absolute;
        width: 9px;
        height: 13px;
        font-size: 13px;
        left:50%;
        top:50%;
        transform: translate(-50%,-50%);
        color: #252525;
        cursor: pointer;
    }

    .chat-editor .icon-wrapper input {
        display: block;
        position: relative;
        width: 100%;
        height: 100%;
        border: none;
        opacity: 0;
        cursor: pointer;
    }

    ::-webkit-file-upload-button {
        cursor: pointer;
    }

    ::file-selector-button {
        cursor: pointer;
    }

    .chat-editor .send-message-input {
        margin-top: 8px;
        display: inline-block;
        width: calc(100% - 20px - 20px - 30px - 50px - 50px);
        height: 30px;
        border-radius: 100px;
        border: 1px solid var(--border-color);
        padding-left: 15px;
        padding-right: 15px;
        color: var(--base-color);
    }

    .chat-editor .send-message-input:focus {
        outline: none;
    }

    .chat-editor .icon-wrapper-send {
        display: inline-block;
        position: relative;
        width: 30px;
        height: 30px;
        vertical-align: top;
        border-radius: 100px;
        cursor: pointer;
        margin-top: 10px;
        margin-bottom: 10px;
        background: var(--button-color);
        margin-left: 8px;
    }

    .chat-editor .icon-wrapper-send svg {
        display: block;
        position: absolute;
        width: 13px;
        height: 13px;
        left:50%;
        top:50%;
        transform: translate(-50%,-50%);
    }

    .chat-editor .sendprogress {
        display: block;
        position: absolute;
        width: 0;
        height: 3px;
        background: var(--button-color);
        margin-top: -3px;
        transition: 0.3s;
        border-bottom-right-radius: 10px;
        border-top-right-radius: 10px;
    }
</style>
<div class="chat-editor">
    <div id="sendprogress" class="sendprogress" style="width: {$sendProgress}%"></div>
    {#if
        $currentUser !== undefined &&
        $currentUser.type === UserRole.ServiceProvider &&
        $selectedConversation !== undefined &&
        (
            $selectedConversation.conversationObj.state === ConversationState.Quoted ||
            $selectedConversation.conversationObj.state === ConversationState.Rejected
        )}
        <div class="icon-wrapper" style="filter: brightness(80%)">
            <i class="fa-regular fa-file"></i>
            <input disabled bind:files={$fileValue} on:change={() => {sendFileMessageRequest()}} class="input-file" id="fileInput" type="file">
        </div>
    {:else}
        <div class="icon-wrapper">
            <i class="fa-regular fa-file"></i>
            <input bind:files={$fileValue} on:change={() => {sendFileMessageRequest()}} class="input-file" id="fileInput" type="file">
        </div>
    {/if}
    {#if
        $currentUser !== undefined &&
        $currentUser.type === UserRole.ServiceProvider &&
        $selectedConversation !== undefined &&
        (
            $selectedConversation.conversationObj.state === ConversationState.Quoted ||
            $selectedConversation.conversationObj.state === ConversationState.Rejected
        )}
        <input disabled bind:value={$messageField} class="send-message-input" type="text" placeholder="Messaging deactivated..." />
        <div style="filter: grayscale(1)" class="icon-wrapper-send"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="paper-plane"><path fill="#ffffff" d="M20.34,9.32l-14-7a3,3,0,0,0-4.08,3.9l2.4,5.37h0a1.06,1.06,0,0,1,0,.82l-2.4,5.37A3,3,0,0,0,5,22a3.14,3.14,0,0,0,1.35-.32l14-7a3,3,0,0,0,0-5.36Zm-.89,3.57-14,7a1,1,0,0,1-1.35-1.3l2.39-5.37A2,2,0,0,0,6.57,13h6.89a1,1,0,0,0,0-2H6.57a2,2,0,0,0-.08-.22L4.1,5.41a1,1,0,0,1,1.35-1.3l14,7a1,1,0,0,1,0,1.78Z"></path></svg></div>
    {:else}
        <input bind:value={$messageField} on:keydown={(event) => {if(event.key === 'Enter'){sendTextMessageRequest()}}} class="send-message-input" type="text" placeholder="Your message..." />
        <div on:click={() => {sendTextMessageRequest()}} on:keydown={() => {sendTextMessageRequest()}} role="button" tabindex="0" class="icon-wrapper-send"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="paper-plane"><path fill="#ffffff" d="M20.34,9.32l-14-7a3,3,0,0,0-4.08,3.9l2.4,5.37h0a1.06,1.06,0,0,1,0,.82l-2.4,5.37A3,3,0,0,0,5,22a3.14,3.14,0,0,0,1.35-.32l14-7a3,3,0,0,0,0-5.36Zm-.89,3.57-14,7a1,1,0,0,1-1.35-1.3l2.39-5.37A2,2,0,0,0,6.57,13h6.89a1,1,0,0,0,0-2H6.57a2,2,0,0,0-.08-.22L4.1,5.41a1,1,0,0,1,1.35-1.3l14,7a1,1,0,0,1,0,1.78Z"></path></svg></div>
    {/if}
</div>