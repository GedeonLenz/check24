<script lang="ts">
    import type {Message_Offer} from "$lib/types";
    import {
        dateDiff,
        dateStringToDate,
        getCurrentDateTime,
        getOtherUsername, getReview,
        getReviewRequested,
    } from "$lib/tools/clientTools";
    import {requestReview, selectedConversation, sendReview} from "$lib/chat/conversations";
    import {currentUser} from "$lib/chat/user";
    export let message:Message_Offer;
    let isServiceProvider:boolean;
    let otherUser:string | undefined;
    let reviewRequestable:boolean;
    let reviewRequested:boolean;
    let review:number | undefined;
    $: {
        isServiceProvider = $currentUser !== undefined && message.sender.username === $currentUser.username;
        otherUser = $selectedConversation !== undefined ? getOtherUsername($currentUser,$selectedConversation.conversationObj.usernames) : undefined;
        reviewRequestable = $selectedConversation !== undefined && $selectedConversation.conversationObj.dates.accepted !== undefined && dateStringToDate(getCurrentDateTime()).getTime() > dateStringToDate($selectedConversation.conversationObj.dates.accepted).getTime() && dateDiff($selectedConversation.conversationObj.dates.accepted,getCurrentDateTime()) >= 7;
        reviewRequested = getReviewRequested($selectedConversation);
        review = getReview($selectedConversation);
    }
    isServiceProvider = isServiceProvider;
</script>
<style>
    .requestreview {
        background: var(--button-color);
        color: #ffffff;
    }
    .requestreview {
        margin-bottom: 20px;
    }

    .requestreview:hover {
        background: #0c4ccb;
        transform: scale(1.01);
    }
    .requestreview  {
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
    .notice {
        display: block;
        position: relative;
        width: calc(100% - 20px);
        height: 50px;
        line-height: 50px;
        border-radius: 10px;
        padding-left: 15px;
        border: none;
        font-family: "Helvetica Neue","Arial",sans-serif;
        font-size: 15px;
        font-weight: 400;
        margin-bottom: 10px;
        box-sizing: border-box;
        margin-left: 10px;
        margin-right: 10px;
        transition: 0.2s;
        transform: scale(1);
        background: rgba(15, 90, 239, 0.66);
        border-left: 10px solid #0F5AEFFF;
        border-right: 10px solid #0F5AEFFF;
        color: #ffffff;
        text-align:center;
    }
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