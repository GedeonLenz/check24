<script lang="ts">
    import type {Message_Offer, User, ConversationEntry} from "$lib/types";
    import {ConversationState} from "$lib/types";
    import ReviewPanel from "./MessageQuote/ReviewPanel.svelte";
    import ConsentPanel from "./MessageQuote/ConsentPanel.svelte";
    import {currentUser} from "$lib/chat/user";
    import {selectedConversation} from "$lib/chat/conversations";

    export let message:Message_Offer;

    let mymessage:boolean;
    let unread:boolean;
    let isServiceProvider:boolean | undefined;
    let isStateBeginning:boolean;
    let isStateAccepted:boolean;
    let isStateRejected:boolean;
    let isValidState:boolean;

    let statuslabel = "";
    $: {
        mymessage = $currentUser !== undefined && message.sender.username === $currentUser.username;
        unread = !mymessage && message.read === false;
        isServiceProvider = $currentUser !== undefined ? message.sender.username === $currentUser.username : undefined;
        isStateBeginning = ($selectedConversation !== undefined && $selectedConversation.conversationObj.state === ConversationState.Quoted) || ($selectedConversation !== undefined && $selectedConversation.conversationObj.state === ConversationState.Chatting);
        isStateAccepted = ($selectedConversation !== undefined && $selectedConversation.conversationObj.state === ConversationState.Accepted);
        isStateRejected = ($selectedConversation !== undefined && $selectedConversation.conversationObj.state === ConversationState.Rejected);
        isValidState = isStateBeginning || isStateAccepted || isStateRejected;
        if(isServiceProvider) {
            if(isStateBeginning) statuslabel="Pending customer decision";
            else if(isStateAccepted) statuslabel="Accepted Quote";
            else if(isStateRejected) statuslabel="Rejected Quote";
        }
        else{
            if(isStateBeginning) statuslabel="Received Quote";
            else if(isStateAccepted) statuslabel="Accepted Quote";
            else if(isStateRejected) statuslabel="Rejected Quote";
        }
    }
    mymessage = mymessage;
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
</style>
{#if $selectedConversation !== undefined && isValidState}
    <div class="chat-message message-quote message-quote-sent {unread ? 'message-unread' : ''}">
        <div class="message-wrapper">
            <span class="price">{message.details.price}€</span>
            <span class="status">{statuslabel}</span>
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

