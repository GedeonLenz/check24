<script lang="ts">
    import {acceptOffer, declineOffer} from "$lib/chat/messages";
</script>
<button on:click={acceptOffer} class="accept">Accept Quote</button>
<button on:click={declineOffer} class="decline">Decline Quote</button>