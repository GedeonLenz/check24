<script lang="ts">
    import {MessageType, type User} from "$lib/types.js";
    import MessageAccept from "../ChatContainer/ChatHistory/Messages/MessageAccept.svelte";
    import MessageStandard from "../ChatContainer/ChatHistory/Messages/MessageStandard.svelte";
    import MessageFile from "../ChatContainer/ChatHistory/Messages/MessageFile.svelte";
    import MessageReject from "../ChatContainer/ChatHistory/Messages/MessageReject.svelte";
    import MessageQuote from "../ChatContainer/ChatHistory/Messages/MessageQuote.svelte";
    import {messages} from "$lib/chat/messages";
</script>

<div class="chat-history">
    <div class="chat-history-content" id="chat-history-content" >
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