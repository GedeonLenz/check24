<script lang="ts">
    import type {ConversationEntry, Message_Offer, User} from "$lib/types";
    import {
        dateDiff,
        dateStringToDate,
        getCurrentDateTime,
        getOtherUsername, getReview,
        getReviewRequested, requestConversationReview, reviewConversation
    } from "$lib/tools/clientTools";
    import {error, success} from "$lib/chat/notifications";
    import {selectedConversation} from "$lib/chat/conversations";
    import {currentUser} from "$lib/chat/user";
    export let message:Message_Offer;

    let isServiceProvider = $currentUser !== undefined && message.sender.username === $currentUser.username;
    let otherUser = $selectedConversation !== undefined ? getOtherUsername($currentUser,$selectedConversation.conversationObj.usernames) : undefined;
    let reviewRequestable = $selectedConversation !== undefined && $selectedConversation.conversationObj.dates.accepted !== undefined && dateStringToDate(getCurrentDateTime()).getTime() > dateStringToDate($selectedConversation.conversationObj.dates.accepted).getTime() && dateDiff($selectedConversation.conversationObj.dates.accepted,getCurrentDateTime()) >= 7;
    let reviewRequested = getReviewRequested($selectedConversation);
    let review = getReview($selectedConversation);

    async function requestReview() {
        if($selectedConversation !== undefined) {
            let res = await requestConversationReview($selectedConversation.conversationObj._id);
            if(res != false && res.status == 200) {
                success.set('Review requested');
                await loadMessages();
            }
            else{
                error.set('An Error occurred while trying to request a review. Please try again later.');
            }
        }
    }

    async function sendReview(rating:number) {
        if($selectedConversation !== undefined) {
            let res = await reviewConversation($selectedConversation.conversationObj._id,rating);
            if(res != false && res.status == 200) {
                success.set('Review sent');
                await loadMessages();
            }
            else{
                error.set('An Error occurred while trying to send your review. Please try again later.');
            }
        }
    }

</script>
<style>
    .star-wrapper {
        display: flex;
        position: relative;
        width: 100%;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: center;
        align-items: center;
        align-content: center;
        row-gap: 10px;
        margin-bottom: 20px;
        margin-top: 20px;
    }

    .review-desc {
        display: block;
        position: relative;
        width: 100%;
        height: auto;
        color: #6b6b6b;
        font-size: 12px;
        font-weight: 400;
        text-align: center;
    }
    .star-wrapper .star, .star-wrapper .star-filled  {
        color: var(--button-color);
        font-size: 20px;
    }
    .star-click {
        cursor: pointer !important;
        border-radius: 100px;
    }
    .star-click:hover {
        color: #093fa9;
    }
</style>
{#if review !== undefined}
    {#if isServiceProvider}
        <span class="review-desc">Customer {otherUser} rated your service with:</span>
    {:else}
        <span class="review-desc">You rated service provider {otherUser}'s service with</span>
    {/if}
    <div class="star-wrapper">
        {#each Array(review) as _, i (i)}
            <i id="star-{i+1}" class="star-filled fa-solid fa-star"></i>
        {/each}
        {#each Array(5-review) as _, i (i)}
            <i id="star-{review+i+1}" class="star fa-regular fa-star"></i>
        {/each}
    </div>
{:else if reviewRequested}
    {#if isServiceProvider}
        <span class="notice">You requested a review from customer {otherUser}</span>
    {:else}
        <span class="review-desc">Service provider {otherUser} kindly asks you for a review:</span>
        <div class="star-wrapper star-new-review-wrapper">
            {#each Array(5) as _, i (i)}
                <i id="star-{i+1}" role="button" tabindex={i} on:keydown={() => {sendReview(i+1)}} on:click={() => {sendReview(i+1)}} class="star star-click fa-regular fa-star"></i>
            {/each}
        </div>
    {/if}
{:else if reviewRequestable}
    {#if isServiceProvider}
        <button on:click={requestReview} class="requestreview">Request Review</button>
    {/if}
{/if}