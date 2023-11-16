<script lang="ts">
    import {archiveConversation, getOtherUsername} from "$lib/tools/clientTools.js";
    import {type User, UserRole} from "$lib/types.js";
    import {selectedConversation} from "$lib/chat/conversations";
    import {error,success} from "$lib/chat/notifications";
    import {currentUser} from "$lib/chat/user";
    import {chatOpen} from "$lib/chat/states";

    async function archiveChat() {
        if($selectedConversation) {
            let res = await archiveConversation($selectedConversation?.conversationObj._id);
            if(res == false || res.status != 200) {
                error.set('An Error occurred while trying to archive your chat. Please try again later.');
            }
            else{
                success.set('Chat archived');
                selectedConversation.set(undefined)
                await renderConversationList(true);
            }
        }
    }
</script>

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