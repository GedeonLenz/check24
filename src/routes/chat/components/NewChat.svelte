<script lang="ts">
    import {newChatVisible} from "$lib/chat/states.js";
    import {sendQuote} from "$lib/chat/conversations";
    let quote_username:string = '';
    let quote_price:number = 0;
    let quote_text:string = '';
</script>
<style>
    @media screen and (max-width: 720px) {
        .new-chat {
            background: #ffffff !important;
            padding-top: 40px !important;
            overflow: auto !important;
        }
        .new-chat-container {
            height: 100vh !important;
            overflow: hidden !important;
        }
    }

    .new-chat {
        display: block;
        position: fixed;
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        background: rgba(0,0,0,0.4);
        z-index: 999999;
        backdrop-filter: blur(3px);
        -webkit-backdrop-filter: blur(3px);
    }

    .new-chat-container {
        display: block;
        position: relative;
        max-width: 500px;
        height: 500px;
        border-radius: 10px;
        background: #ffffff;
        left:50%;
        top:50%;
        transform: translate(-50%,-50%);
        padding: 40px;
        padding-top: 35px;
    }

    .new-chat-container h2 {
        display: block;
        position: relative;
        width: 100%;
        height: 25px;
        font-family: "Helvetica Neue","Arial",sans-serif;
        font-size: 25px;
        font-weight: 600;
        margin: 0 0 30px;
    }

    textarea {
        resize: none;
    }
    .new-chat-container input:focus, .new-chat-container textarea:focus {
        outline: none;
        border: 2px solid var(--button-color) !important;
    }

    .new-chat-container label{
        display: block;
        font-family: "Helvetica Neue","Arial",sans-serif;
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 10px;
        margin-top: 20px;
    }
    .new-chat-container input, .new-chat-container textarea {
        display: block;
        position: relative;
        border: 1px solid var(--button-border);
        height: 40px;
        border-radius: 6px;
        width: 100%;
        margin-bottom: 10px;
        font-family: "Helvetica Neue","Arial",sans-serif;
        font-size: 14px;
        font-weight: 600;
        color:var(--base-color);
        padding-left: 15px;
        padding-right: 15px;
        box-sizing:border-box;
    }
    .new-chat-container textarea {
        height: 170px;
        padding: 15px;
    }

    .new-chat-container button {
        display: block;
        position: relative;
        width: 100%;
        height: 50px;
        border-radius: 6px;
        border: none;
        background: var(--button-color);
        color: #ffffff;
        font-family: "Helvetica Neue","Arial",sans-serif;
        font-size: 16px;
        font-weight: 600;
        margin-top: 20px;
        cursor: pointer;
    }

    .new-chat-container i {
        display: block;
        position: absolute;
        top: 40px;
        right: 45px;
        font-size: 30px;
        color: var(--button-border);
        cursor: pointer;
        transition: 0.1s;
    }

    .new-chat-container i:hover {
        color: var(--button-color);
    }
    #newchat {
        margin-left: 18px;
    }
</style>
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