<script lang="ts">
    import {acceptOffer, declineOffer} from "$lib/chat/messages";
</script>
<style>
    .accept, .decline {
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
    .accept {
        background: var(--button-color);
        color: #ffffff;
    }
    .accept:hover {
        background: #0c4ccb;
        transform: scale(1.01);
    }
    .decline {
        background: #ffffff;
        color: var(--base-color);
        border: 2px solid #EAEAEA;
        margin-bottom: 20px;
    }
    .decline:hover {
        background: #f8f8f8;
        transform: scale(1.01);
    }
</style>
<button on:click={acceptOffer} class="accept">Accept Quote</button>
<button on:click={declineOffer} class="decline">Decline Quote</button>