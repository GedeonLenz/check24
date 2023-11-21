<script lang="ts">
    import {MessageType} from "$lib/types.js";
    import MessageAccept from "../ChatContainer/ChatHistory/Messages/MessageAccept.svelte";
    import MessageStandard from "../ChatContainer/ChatHistory/Messages/MessageStandard.svelte";
    import MessageFile from "../ChatContainer/ChatHistory/Messages/MessageFile.svelte";
    import MessageReject from "../ChatContainer/ChatHistory/Messages/MessageReject.svelte";
    import MessageQuote from "../ChatContainer/ChatHistory/Messages/MessageQuote.svelte";
    import {checkScrollLoad, messages} from "$lib/chat/messages";
</script>
<style>
    @import "ChatHistory/Messages/messages.css";
    .chat-history {
        display: block;
        position: relative;
        height: calc(100% - 112px);
        overflow-x: hidden;
        overflow-y: hidden;
    }

    .chat-history-content {
        display: block;
        position: relative;
        height: auto;
        max-height: calc(100% - 15px);
        overflow-x: visible;
        overflow-y: auto;
        padding: 15px;
        padding-top: 0;
    }

    #top-placeholder {
        display: block;
        position: relative;
        height: 35px;
        margin-bottom: 20px;
        background: transparent;
    }

    .unread-banner span {
        display: block;
        position: relative;
        line-height: 15px;
        color: #939393;
        font-family: "Helvetica Neue","Arial",sans-serif;
        font-size: 15px;
        font-weight: 600;
    }
</style>
<div class="chat-history">
    <div class="chat-history-content" id="chat-history-content" on:scroll={checkScrollLoad}>
        <div id="top-placeholder"></div>
        {#each $messages as message}
            {#if message.messageType === MessageType.File}
                <MessageFile message={message}></MessageFile>
            {:else if message.messageType === MessageType.Offer}
                <MessageQuote message={message}></MessageQuote>
            {:else if message.messageType === MessageType.Accept}
                <MessageAccept message={message}></MessageAccept>
            {:else if message.messageType === MessageType.Reject}
                <MessageReject message={message}></MessageReject>
            {:else if message.messageType === MessageType.Standard}
                <MessageStandard message={message}></MessageStandard>
            {/if}
        {/each}
    </div>
</div>