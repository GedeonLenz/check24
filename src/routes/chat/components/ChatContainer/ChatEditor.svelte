<script lang="ts">
    import {type ConversationEntry, ConversationState, type User, UserRole} from "$lib/types.js";
    import {sendFileMessage, sendTextMessage} from "$lib/tools/clientTools";

    export let currentUser:User;
    export let selectedConversation:ConversationEntry | undefined


    let fileValue: FileList | null = null;
    async function sendFileMessageRequest() {
        if (fileValue) {
            let file: File | null = fileValue.item(0);
            if (selectedConversation && file != null) {
                sendProgress = 2;
                let updateFileProgress = (progress:number) => {
                    sendProgress = progress*0.8;
                }
                let res = await sendFileMessage(currentUser, selectedConversation.conversationObj._id, file,updateFileProgress);
                if(res != false) {
                    sendProgress = 95;
                    await loadMessages();
                    sendProgress = 100;
                } else {
                    showError('An Error occurred while trying to upload you file. Please try again later.');
                }
                resetProgressBar();
            }
        }
    }

    let messageField = "";
    async function sendTextMessageRequest() {
        if(messageField == "") return;
        if(currentUser.type === UserRole.ServiceProvider &&
            selectedConversation !== undefined &&
            (
                selectedConversation.conversationObj.state === ConversationState.Quoted ||
                selectedConversation.conversationObj.state === ConversationState.Rejected
            )) {
            return;
        }
        if(selectedConversation) {
            sendProgress = 10;
            let res = await sendTextMessage(currentUser,selectedConversation?.conversationObj._id,messageField);
            sendProgress = 80;
            if(res != false && res.status == 200) {
                await loadMessages();
            }
            else{
                showError('An Error occurred while trying to send your message. Please try again later.');
            }
            messageField = "";
            sendProgress = 100;
            setTimeout(() => {
                resetProgressBar();
            }, 500);
            scrollBottom();
        }
    }

    let sendProgress:number = 0;
    function resetProgressBar() {
        let progbar = document.getElementById('sendprogress')
        if(progbar) {
            progbar.style.display = 'none';
            sendProgress = 0;
            setTimeout(() => {
                (progbar as HTMLElement).style.display = 'block';
            }, 300);
        }
    }
</script>

<div class="chat-editor">
    <div id="sendprogress" class="sendprogress" style="width: {sendProgress}%"></div>
    {#if
        currentUser.type === UserRole.ServiceProvider &&
        selectedConversation !== undefined &&
        (
            selectedConversation.conversationObj.state === ConversationState.Quoted ||
            selectedConversation.conversationObj.state === ConversationState.Rejected
        )}
        <div class="icon-wrapper" style="filter: brightness(80%)">
            <i class="fa-regular fa-file"></i>
            <input disabled bind:files={fileValue} on:change={sendFileMessageRequest} class="input-file" id="fileInput" type="file">
        </div>
    {:else}
        <div class="icon-wrapper">
            <i class="fa-regular fa-file"></i>
            <input bind:files={fileValue} on:change={sendFileMessageRequest} class="input-file" id="fileInput" type="file">
        </div>
    {/if}
    {#if
        currentUser.type === UserRole.ServiceProvider &&
        selectedConversation !== undefined &&
        (
            selectedConversation.conversationObj.state === ConversationState.Quoted ||
            selectedConversation.conversationObj.state === ConversationState.Rejected
        )}
        <input disabled bind:value={messageField} class="send-message-input" type="text" placeholder="Messaging deactivated..." />
        <div style="filter: grayscale(1)" class="icon-wrapper-send"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="paper-plane"><path fill="#ffffff" d="M20.34,9.32l-14-7a3,3,0,0,0-4.08,3.9l2.4,5.37h0a1.06,1.06,0,0,1,0,.82l-2.4,5.37A3,3,0,0,0,5,22a3.14,3.14,0,0,0,1.35-.32l14-7a3,3,0,0,0,0-5.36Zm-.89,3.57-14,7a1,1,0,0,1-1.35-1.3l2.39-5.37A2,2,0,0,0,6.57,13h6.89a1,1,0,0,0,0-2H6.57a2,2,0,0,0-.08-.22L4.1,5.41a1,1,0,0,1,1.35-1.3l14,7a1,1,0,0,1,0,1.78Z"></path></svg></div>
    {:else}
        <input bind:value={messageField} on:keydown={(event) => {if(event.key === 'Enter'){sendTextMessageRequest();}}} class="send-message-input" type="text" placeholder="Your message..." />
        <div on:click={sendTextMessageRequest} on:keydown={sendTextMessageRequest} role="button" tabindex="0" class="icon-wrapper-send"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="paper-plane"><path fill="#ffffff" d="M20.34,9.32l-14-7a3,3,0,0,0-4.08,3.9l2.4,5.37h0a1.06,1.06,0,0,1,0,.82l-2.4,5.37A3,3,0,0,0,5,22a3.14,3.14,0,0,0,1.35-.32l14-7a3,3,0,0,0,0-5.36Zm-.89,3.57-14,7a1,1,0,0,1-1.35-1.3l2.39-5.37A2,2,0,0,0,6.57,13h6.89a1,1,0,0,0,0-2H6.57a2,2,0,0,0-.08-.22L4.1,5.41a1,1,0,0,1,1.35-1.3l14,7a1,1,0,0,1,0,1.78Z"></path></svg></div>
    {/if}
</div>