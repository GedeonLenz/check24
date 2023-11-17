<script lang="ts">

import ChatEntry from "./ChatWrapper/ChatEntry.svelte";
import {
    conversations,
} from "$lib/chat/conversations";
</script>

<div class="chat-wrapper">
    <div class="chat-wrapper-content">
        {#each $conversations as conversation}
            <ChatEntry conversation={conversation}></ChatEntry>
        {/each}
    </div>
</div>