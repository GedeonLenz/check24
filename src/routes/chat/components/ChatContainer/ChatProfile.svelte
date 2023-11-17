<script lang="ts">
    import {getOtherUsername} from "$lib/tools/clientTools.js";
    import {UserRole} from "$lib/types.js";
    import {selectedConversation} from "$lib/chat/conversations";
    import {currentUser} from "$lib/chat/user";
    import {chatOpen} from "$lib/chat/states";
    import {archiveChat} from "$lib/chat/conversations";
</script>
<style>
    .chat-profile {
        display: block;
        position: relative;
        width: 100%;
        left: 0;
        top: 0;
        height: 60px;
        border-bottom: 1px solid rgba(0,0,0,0.1);
    }
    .chat-profile .back {
        display: block;
        position: relative;
        font-size: 15px;
        margin-right: 10px;
        color: var(--base-color);
        text-align: left;

    }
    @media screen and (max-width: 720px) {
        .chat-profile .icon-wrapper-back {
            display: inline-block !important;
        }
    }

    .chat-profile .chat-bar-picture {
        display: inline-block;
        position: relative;
        width: 40px;
        height: 40px;
        background: #ffffff;
        border-radius: 1000px;
        overflow: hidden !important;
        margin-left: 20px;
        margin-right: 10px;
        border: 1px solid #eeeeee;
        margin-top:10px;
        margin-bottom: 10px;
    }


    .chat-profile .chat-title {
        display: inline-block;
        height: 60px;
        font-family: "Helvetica Neue","Arial",sans-serif;
        font-size: 16px;
        font-weight: 600;
        line-height: 60px;
        text-align: left;
        vertical-align: top;
    }

    .chat-profile .icon-wrapper {
        display: inline-block;
        position: absolute;
        width: 35px;
        height: 35px;
        vertical-align: middle;
        right: 30px;
        top:50%;
        transform: translateY(-50%);
        border-radius: 100px;
        background: #e7e7e7;
        cursor: pointer;
        transition: 0.1s;
    }
    .chat-profile .icon-wrapper:hover {
        background: #d7d7d7;
    }
    .chat-profile .icon-wrapper-back {
        display: none;
        position: relative;
        width: 35px;
        height: 35px;
        vertical-align: middle;
        left: 20px;
        transform: translateY(-50%);
        border-radius: 100px;
        cursor: pointer;
    }
    .chat-profile .icon-wrapper i {
        display: block;
        position: absolute;
        width: 15px;
        height: 15px;
        font-size: 15px;
        left:50%;
        top:50%;
        transform: translate(-50%,-50%);
        color: #252525;
    }
    .chat-bar-picture img {
        display: block;
        position: relative;
        width: 100%;
        height: 100%;
    }
</style>
<div class="chat-profile">
    <div class="icon-wrapper-back" on:click={() => {$chatOpen = false}}><i class="archive-disabled fa-solid fa-angle-left"></i></div>
    <span class="chat-bar-picture">
                <img src="{$selectedConversation !== undefined && $selectedConversation.pictureURL !== '' ? $selectedConversation.pictureURL : '/user.png'}" alt="profile-icon">
            </span>
    <span class="chat-title">{$selectedConversation !== undefined ? getOtherUsername($currentUser,$selectedConversation.conversationObj.usernames) : ''}</span>
    {#if
        $selectedConversation !== undefined &&
        (
            ($currentUser !== undefined &&
            $currentUser.type === UserRole.Customer &&
            (
                $selectedConversation.conversationObj.archived === undefined ||
                ($selectedConversation.conversationObj.archived !== undefined && $selectedConversation.conversationObj.archived.customer === undefined) ||
                ($selectedConversation.conversationObj.archived !== undefined && $selectedConversation.conversationObj.archived.customer !== undefined && $selectedConversation.conversationObj.archived.customer === false)
            ))
            ||
            ($currentUser !== undefined &&
            $currentUser.type === UserRole.ServiceProvider &&
            (
                $selectedConversation.conversationObj.archived === undefined ||
                ($selectedConversation.conversationObj.archived !== undefined && $selectedConversation.conversationObj.archived.serviceprovider === undefined) ||
                ($selectedConversation.conversationObj.archived !== undefined && $selectedConversation.conversationObj.archived.serviceprovider !== undefined && $selectedConversation.conversationObj.archived.serviceprovider === false)
            ))
        )}
        <div class="icon-wrapper" on:click={archiveChat}><i class="fa-solid fa-box-archive"></i></div>
    {/if}
</div>