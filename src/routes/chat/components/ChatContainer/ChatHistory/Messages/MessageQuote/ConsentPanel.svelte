<script lang="ts">
    import {sendAcceptMessage, sendRejectMessage} from "$lib/tools/clientTools";
    import {sendProgress} from "$lib/chat/states";
    import {error} from "$lib/chat/notifications";
    import {selectedConversation} from "$lib/chat/conversations";
    import {currentUser} from "$lib/chat/user";

    async function acceptOffer() {
        if($selectedConversation) {
            sendProgress.set(10);
            let res = await sendAcceptMessage($currentUser,$selectedConversation?.conversationObj._id)
            sendProgress.set(80);
            if(res != false && res.status == 200) {
                await loadMessages();
            }
            else{
                error.set('An Error occurred while trying to send your message. Please try again later.');
            }
            sendProgress.set(100);
            setTimeout(() => {
                resetProgressBar();
            }, 500);
            scrollBottom();
        }
    }

    async function declineOffer() {
        if($selectedConversation) {
            sendProgress.set(10);
            let res = await sendRejectMessage($currentUser,$selectedConversation?.conversationObj._id);
            sendProgress.set(80);
            if(res != false && res.status == 200) {
                await loadMessages();
            }
            else{
                error.set('An Error occurred while trying to send your message. Please try again later.');
            }
            sendProgress.set(100);
            setTimeout(() => {
                resetProgressBar();
            }, 500);
            scrollBottom();
        }
    }
</script>
<button on:click={acceptOffer} class="accept">Accept Quote</button>
<button on:click={declineOffer} class="decline">Decline Quote</button>