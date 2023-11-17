<script lang="ts">
    import {newChatVisible} from "$lib/chat/states.js";
    import {sendQuote} from "$lib/chat/conversations";
    let quote_username:string = '';
    let quote_price:number = 0;
    let quote_text:string = '';
</script>
{#if $newChatVisible}
    <div class="new-chat">
        <div class="new-chat-container">
            <h2>Send Quote</h2>
            <i id="close-newchat" role="button" tabindex="0" on:keydown={() => {newChatVisible.set(false)}} on:click={() => {newChatVisible.set(false)}} class="fa-solid fa-xmark"></i>
            <label for="quote-username">Username</label>
            <input bind:value={quote_username} type="text" placeholder="Username" id="quote-username" required>
            <label for="quote-price">Price</label>
            <input bind:value={quote_price} type="number" placeholder="Price" id="quote-price" required>
            <label for="quote-text">Message</label>
            <textarea bind:value={quote_text} id="quote-text" placeholder="Your message..."></textarea>
            <button on:click={() => {sendQuote(quote_username,quote_price,quote_text)}}>Send Quote</button>
        </div>
    </div>
{/if}