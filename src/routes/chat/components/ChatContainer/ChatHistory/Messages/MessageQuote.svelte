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

