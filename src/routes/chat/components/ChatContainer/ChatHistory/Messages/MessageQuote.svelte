<script lang="ts">
    import type {Message_Offer, User, ConversationEntry} from "$lib/types";
    import {ConversationState} from "$lib/types";
    import ReviewPanel from "./MessageQuote/ReviewPanel.svelte";
    import ConsentPanel from "./MessageQuote/ConsentPanel.svelte";
    import {currentUser} from "$lib/chat/user";
    import {selectedConversation} from "$lib/chat/conversations";

    export let message:Message_Offer;

    let mymessage = $currentUser !== undefined && message.sender.username === $currentUser.username;
    let unread = !mymessage && message.read === false;

    let isServiceProvider = $currentUser !== undefined ? message.sender.username === $currentUser.username : undefined;


    let isStateBeginning = ($selectedConversation !== undefined && $selectedConversation.conversationObj.state === ConversationState.Quoted) || ($selectedConversation !== undefined && $selectedConversation.conversationObj.state === ConversationState.Chatting);
    let isStateAccepted = ($selectedConversation !== undefined && $selectedConversation.conversationObj.state === ConversationState.Accepted);
    let isStateRejected = ($selectedConversation !== undefined && $selectedConversation.conversationObj.state === ConversationState.Rejected);
    let isValidState = isStateBeginning || isStateAccepted || isStateRejected;

    let status = "";
    if(isServiceProvider) {
        if(isStateBeginning) status="Pending customer decision";
        else if(isStateAccepted) status="Accepted Quote";
        else if(isStateRejected) status="Rejected Quote";
    }
    else{
        if(isStateBeginning) status="Received Quote";
        else if(isStateAccepted) status="Accepted Quote";
        else if(isStateRejected) status="Rejected Quote";
    }
</script>
<style>
    .message-quote {
        text-align: center;
        margin-bottom: 30px;
    }
    .message-quote .message-wrapper {
        width: 450px;
        max-width: 450px;
        min-height: 167px;
        height: auto;
        background: #ffffff;
        border: 1px solid #EAEAEA;
        padding: 0;
    }

    @media screen and (max-width: 885px) {
        .message-quote .message-wrapper {
            width: 100%;
        }
    }


    .message-quote .status {
        display: block;
        position: relative;
        width: 100%;
        margin-top: 2px;
        font-family: "Helvetica Neue","Arial",sans-serif;
        font-size: 15px;
        font-weight: 500;
        color: var(--font-color);
        text-align: center;
        padding-bottom: 20px;
        border-bottom: 1px solid #EAEAEA;
    }

    .message-quote .price {
        display: block;
        position: relative;
        width: 100%;
        font-family: "Helvetica Neue","Arial",sans-serif;
        font-size: 30px;
        font-weight: 600;
        color: var(--font-color);
        text-align: center;
        margin-top: 20px;
    }


    .message-quote .text {
        display: block;
        position: relative;
        width: 100%;
        height: auto;
        padding: 20px;
        box-sizing: border-box;
        margin-top: 5px;
        color: #1C1C1C;
        font-family: "Helvetica Neue","Arial",sans-serif;
        font-size: 14px;
        font-weight: 400;
        margin-bottom: 5px;
    }


    .message-quote .accept, .message-quote .requestreview, .message-quote .decline {
        display: block;
        position: relative;
        width: calc(100% - 40px);
        height: 50px;
        border-radius: 10px;
        border: none;
        font-family: "Helvetica Neue","Arial",sans-serif;
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 10px;
        cursor: pointer;
        margin-left: 20px;
        margin-right: 20px;
        transition: 0.2s;
        transform: scale(1);
    }

    .message-quote .accept, .message-quote .requestreview {
        background: var(--button-color);
        color: #ffffff;
    }
    .message-quote .requestreview {
        margin-bottom: 20px;
    }

    .message-quote .requestreview:hover {
        background: #0c4ccb;
        transform: scale(1.01);
    }

    .message-quote .accept:hover {
        background: #0c4ccb;
        transform: scale(1.01);
    }

    .message-quote .decline {
        background: #ffffff;
        color: var(--base-color);
        border: 2px solid #EAEAEA;
        margin-bottom: 20px;
    }

    .message-quote .decline:hover {
        background: #f8f8f8;
        transform: scale(1.01);
    }

    .message-quote .notice {
        display: block;
        position: relative;
        width: calc(100% - 20px);
        height: 50px;
        line-height: 50px;
        border-radius: 10px;
        padding-left: 15px;
        border: none;
        font-family: "Helvetica Neue","Arial",sans-serif;
        font-size: 15px;
        font-weight: 400;
        margin-bottom: 10px;
        box-sizing: border-box;
        margin-left: 10px;
        margin-right: 10px;
        transition: 0.2s;
        transform: scale(1);
        background: rgba(15, 90, 239, 0.66);
        border-left: 10px solid #0F5AEFFF;
        border-right: 10px solid #0F5AEFFF;
        color: #ffffff;
        text-align:center;
    }
</style>
{#if $selectedConversation !== undefined && isValidState}
    <div class="chat-message message-quote message-quote-sent {unread ? 'message-unread' : ''}">
        <div class="message-wrapper">
            <span class="price">{message.details.price}€</span>
            <span class="status">{status}</span>
            <p class="text">{message.text}</p>
            {#if isStateBeginning}
                {#if !isServiceProvider}
                    <ConsentPanel></ConsentPanel>
                {/if}
            {:else if isStateAccepted}
                <ReviewPanel message={message}></ReviewPanel>
            {/if}
        </div>
    </div>
{:else}
    <div class="chat-message {unread ? 'message-unread' : ''} {mymessage ? 'message-me' : 'message-other'}">
        <div class="message-wrapper">Unable to load message</div>
    </div>
{/if}

