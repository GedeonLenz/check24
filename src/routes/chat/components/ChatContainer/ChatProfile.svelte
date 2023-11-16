<script lang="ts">
    import {archiveConversation, getOtherUsername} from "$lib/tools/clientTools.js";
import {type ConversationEntry, type User, UserRole} from "$lib/types.js";

export let selectedConversation:ConversationEntry | undefined;
export let currentUser:User;
export let chatOpen:boolean;

async function archiveChat() {
    if(selectedConversation) {
        let res = await archiveConversation(selectedConversation?.conversationObj._id);
        if(res == false || res.status != 200) {
            showError('An Error occurred while trying to archive your chat. Please try again later.');
        }
        else{
            showSuccess('Chat archived');
            selectedConversation = undefined;
            await renderConversationList(true);
        }
    }
}
</script>

<div class="chat-profile">
    <div class="icon-wrapper-back" on:click={() => {chatOpen = false}}><i class="archive-disabled fa-solid fa-angle-left"></i></div>
    <span class="chat-bar-picture">
                <img src="{selectedConversation !== undefined && selectedConversation.pictureURL !== '' ? selectedConversation.pictureURL : '/user.png'}" alt="profile-icon">
            </span>
    <span class="chat-title">{selectedConversation !== undefined ? getOtherUsername(currentUser,selectedConversation.conversationObj.usernames) : ''}</span>
    {#if
        selectedConversation !== undefined &&
        (
            currentUser.type === UserRole.Customer &&
            (
                selectedConversation.conversationObj.archived === undefined ||
                (selectedConversation.conversationObj.archived !== undefined && selectedConversation.conversationObj.archived.customer === undefined) ||
                (selectedConversation.conversationObj.archived !== undefined && selectedConversation.conversationObj.archived.customer !== undefined && selectedConversation.conversationObj.archived.customer === false)
            )
            ||
            currentUser.type === UserRole.ServiceProvider &&
            (
                selectedConversation.conversationObj.archived === undefined ||
                (selectedConversation.conversationObj.archived !== undefined && selectedConversation.conversationObj.archived.serviceprovider === undefined) ||
                (selectedConversation.conversationObj.archived !== undefined && selectedConversation.conversationObj.archived.serviceprovider !== undefined && selectedConversation.conversationObj.archived.serviceprovider === false)
            )
        )}
        <div class="icon-wrapper" on:click={archiveChat}><i class="fa-solid fa-box-archive"></i></div>
    {/if}
</div>