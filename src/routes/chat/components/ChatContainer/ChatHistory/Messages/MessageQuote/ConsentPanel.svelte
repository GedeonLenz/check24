<script lang="ts">
    import {sendAcceptMessage, sendRejectMessage} from "$lib/tools/clientTools";
    import type {ConversationEntry, User} from "$lib/types";

    export let currentUser:User;
    export let selectedConversation:ConversationEntry;
    async function acceptOffer() {
        if(selectedConversation) {
            sendProgress = 10;
            let res = await sendAcceptMessage(currentUser,selectedConversation?.conversationObj._id)
            sendProgress = 80;
            if(res != false && res.status == 200) {
                await loadMessages();
            }
            else{
                showError('An Error occurred while trying to send your message. Please try again later.');
            }
            sendProgress = 100;
            setTimeout(() => {
                resetProgressBar();
            }, 500);
            scrollBottom();
        }
    }

    async function declineOffer() {
        if(selectedConversation) {
            sendProgress = 10;
            let res = await sendRejectMessage(currentUser,selectedConversation?.conversationObj._id);
            sendProgress = 80;
            if(res != false && res.status == 200) {
                await loadMessages();
            }
            else{
                showError('An Error occurred while trying to send your message. Please try again later.');
            }
            sendProgress = 100;
            setTimeout(() => {
                resetProgressBar();
            }, 500);
            scrollBottom();
        }
    }
</script>
<button on:click={acceptOffer} class="accept">Accept Quote</button>
<button on:click={declineOffer} class="decline">Decline Quote</button>