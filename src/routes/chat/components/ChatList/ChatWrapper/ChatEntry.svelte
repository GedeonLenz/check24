<script lang="ts">
import {getOtherUsername} from "$lib/tools/clientTools.js";
import type {ConversationEntry} from "$lib/types";
import type {Message, Message_Offer, Message_Standard} from "$lib/types";
import {openConversation, selectedConversation} from "$lib/chat/conversations";
import {MessageType} from "$lib/types";
import {currentUser} from "$lib/chat/user";
export let conversation:ConversationEntry;

let isActive:boolean;
$: {
    isActive = $selectedConversation !== undefined && (conversation.conversationObj._id === $selectedConversation.conversationObj._id);
}
isActive = isActive;

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
<style>
    .chat-item {
        display: block;
        position: relative;
        width: 100%;
        height: 65px;
        cursor: pointer;
        border-radius: 8px;
    }

    .chat-item-active {
        background: #f0f0f0;
    }

    .chat-picture {
        display: inline-block;
        position: relative;
        width: 50px;
        height: 50px;
        top: 50%;
        transform: translateY(-50%);
        background: #ffffff;
        border-radius: 1000px;
        overflow: hidden !important;
        margin-left: 10px;
        margin-right: 10px;
        border: 1px solid #eeeeee;
    }
    .chat-picture img {
        display: block;
        position: relative;
        width: 100%;
        height: 100%;
    }

    .chat-details {
        display: inline-block;
        position: relative;
        width: calc(100% - 50px - 20px - 16px);
        height: calc(100% - 9px);
        padding: 4px;
        vertical-align: top;
        margin-top: 4px;
        margin-bottom: 4px;
        box-sizing: border-box;
    }

    .chat-name {
        display: block;
        position: relative;
        text-align: left;
        font-family: "Helvetica Neue","Arial",sans-serif;
        font-size: 13px;
        font-weight: 600;
        color:#3b3b3b;
        vertical-align: top;
        padding-right: 50px;
        box-sizing: border-box;
    }

    .chat-last {
        display: block;
        position: relative;
        width: 100%;
        padding-right: 50px;
        box-sizing: border-box;
        overflow: hidden !important;
        font-family: "Helvetica Neue","Arial",sans-serif;
        font-size: 13px;
        font-weight: 400;
        color:#797979;
        margin-top: 2px;
        vertical-align: top;
        max-height: 30px;
    }

    .chat-unread {
        display: block;
        position: absolute;
        right: 10px;
        top:50%;
        transform: translateY(-50%);
        background: var(--button-color);
        color: #ffffff;
        font-family: "Helvetica Neue","Arial",sans-serif;
        font-size: 11px;
        font-weight: 600;
        width: auto;
        height: 22px;
        line-height: 22px;
        text-align: center;
        border-radius: 100px;
        padding-left: 8px;
        padding-right: 8px;
    }
    @media screen and (max-width: 720px) {
        .chat-item-active {
            background: #ffffff !important;
        }
    }
</style>
<div on:click={() => {openConversation(conversation)}} on:keydown={() => {openConversation(conversation)}} role="button" tabindex="0" class="chat-item {isActive ? 'chat-item-active' : ''}">
    <span class="chat-picture">
        {#if conversation.pictureURL !== ""}
            <img src="{conversation.pictureURL}" alt="profile-icon">
        {:else}
            <img src="/user.png" alt="profile-icon">
        {/if}
    </span>
    <div class="chat-details">
        <span class="chat-name">
            {getOtherUsername($currentUser,conversation.conversationObj.usernames)}
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