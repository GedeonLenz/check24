<script lang="ts">
    import {ConversationState, UserRole} from "$lib/types.js";
    import {selectedConversation} from "$lib/chat/conversations";
    import {currentUser} from "$lib/chat/user";
    import {sendProgress} from "$lib/chat/states";

    let fileValue: FileList | null = null;
    let messageField = "";
</script>

<div class="chat-editor">
    <div id="sendprogress" class="sendprogress" style="width: {sendProgress}%"></div>
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
            <input disabled bind:files={fileValue} on:change={() => {sendFileMessageRequest(fileValue)}} class="input-file" id="fileInput" type="file">
        </div>
    {:else}
        <div class="icon-wrapper">
            <i class="fa-regular fa-file"></i>
            <input bind:files={fileValue} on:change={() => {sendFileMessageRequest(fileValue)}} class="input-file" id="fileInput" type="file">
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
        <input disabled bind:value={messageField} class="send-message-input" type="text" placeholder="Messaging deactivated..." />
        <div style="filter: grayscale(1)" class="icon-wrapper-send"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="paper-plane"><path fill="#ffffff" d="M20.34,9.32l-14-7a3,3,0,0,0-4.08,3.9l2.4,5.37h0a1.06,1.06,0,0,1,0,.82l-2.4,5.37A3,3,0,0,0,5,22a3.14,3.14,0,0,0,1.35-.32l14-7a3,3,0,0,0,0-5.36Zm-.89,3.57-14,7a1,1,0,0,1-1.35-1.3l2.39-5.37A2,2,0,0,0,6.57,13h6.89a1,1,0,0,0,0-2H6.57a2,2,0,0,0-.08-.22L4.1,5.41a1,1,0,0,1,1.35-1.3l14,7a1,1,0,0,1,0,1.78Z"></path></svg></div>
    {:else}
        <input bind:value={messageField} on:keydown={(event) => {if(event.key === 'Enter'){sendTextMessageRequest(messageField)}}} class="send-message-input" type="text" placeholder="Your message..." />
        <div on:click={() => {sendTextMessageRequest(messageField)}} on:keydown={() => {sendTextMessageRequest(messageField)}} role="button" tabindex="0" class="icon-wrapper-send"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="paper-plane"><path fill="#ffffff" d="M20.34,9.32l-14-7a3,3,0,0,0-4.08,3.9l2.4,5.37h0a1.06,1.06,0,0,1,0,.82l-2.4,5.37A3,3,0,0,0,5,22a3.14,3.14,0,0,0,1.35-.32l14-7a3,3,0,0,0,0-5.36Zm-.89,3.57-14,7a1,1,0,0,1-1.35-1.3l2.39-5.37A2,2,0,0,0,6.57,13h6.89a1,1,0,0,0,0-2H6.57a2,2,0,0,0-.08-.22L4.1,5.41a1,1,0,0,1,1.35-1.3l14,7a1,1,0,0,1,0,1.78Z"></path></svg></div>
    {/if}
</div>