<script lang="ts">
import {getOtherUsername} from "$lib/tools/clientTools.js";
import type {User, ConversationEntry} from "$lib/types";
import type {Message, Message_Offer, Message_Standard, MessageType} from "$lib/types";
export let conversation:ConversationEntry;
export let currentUser:User;
export let selectedConversation:ConversationEntry | undefined;

let isActive = selectedConversation !== undefined ? (conversation.conversationObj._id === selectedConversation.conversationObj._id;

function displayLastMessage(lastMessage:Message) {
    let type = lastMessage.messageType;
    if(type === MessageType.Standard) {
        let msg_standard:Message_Standard = lastMessage as Message_Standard;
        return msg_standard.text;
    }
    else if(type === MessageType.Offer) {
        let msg_offer:Message_Offer = lastMessage as Message_Offer;
        if(msg_offer.text.length >= 1){
            return msg_offer.text;
        }
        return "New offer";
    }
    else if(type === MessageType.Accept) {
        return "Accepted offer";
    }
    else if(type === MessageType.Reject) {
        return "Rejected offer";
    }
    else if(type === MessageType.File) {
        return "File";
    }
    else{
        return "No message";
    }
}
</script>

<div on:click={() => {openConversationEntry(conversation,false)}} on:keydown={() => {openConversationEntry(conversation,false)}} role="button" tabindex="0" class="chat-item {isActive ? 'chat-item-active' : ''}">
    <span class="chat-picture">
        {#if conversation.pictureURL !== ""}
            <img src="{conversation.pictureURL}" alt="profile-icon">
        {:else}
            <img src="/user.png" alt="profile-icon">
        {/if}
    </span>
    <div class="chat-details">
        <span class="chat-name">
            {getOtherUsername(currentUser,conversation.conversationObj.usernames)}
        </span>
        <span class="chat-last">
            {displayLastMessage(conversation.lastMessage)}
        </span>
        {#if conversation.unreadCount > 0}
            <span class="chat-unread">
                {conversation.unreadCount}
            </span>
        {/if}
    </div>
</div>