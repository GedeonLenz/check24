<script lang="ts">
    import {initConversation} from "$lib/tools/clientTools";
    import {error, success} from "$lib/chat/notifications";
    import {currentUser} from "$lib/chat/user";

    let newChatVisible = false;
    let quote_username = '';
    let quote_price = 0;
    let quote_text = '';
    async function sendQuote() {
        let res = await initConversation($currentUser,quote_username,quote_text,quote_price);
        newChatVisible = false;
        if(res == false || res.status != 200) {
            error.set('An Error occurred while trying to send your quote. Please try again later.');
        }
        else {
            success.set("Your quote has been sent.");
            let newEntry = await res.json();
            await renderConversationList(true);
            await openConversationEntry(newEntry.data.conversation,true);
        }
        quote_username = '';
        quote_price = 0;
        quote_text = '';
    }
</script>
{#if newChatVisible}
    <div class="new-chat">
        <div class="new-chat-container">
            <h2>Send Quote</h2>
            <i id="close-newchat" role="button" tabindex="0" on:keydown={() => {newChatVisible = false;}} on:click={() => {newChatVisible = false;}} class="fa-solid fa-xmark"></i>
            <label for="quote-username">Username</label>
            <input bind:value={quote_username} type="text" placeholder="Username" id="quote-username" required>
            <label for="quote-price">Price</label>
            <input bind:value={quote_price} type="number" placeholder="Price" id="quote-price" required>
            <label for="quote-text">Message</label>
            <textarea bind:value={quote_text} id="quote-text" placeholder="Your message..."></textarea>
            <button on:click={sendQuote}>Send Quote</button>
        </div>
    </div>
{/if}