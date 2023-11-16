<script lang="ts">
    import {getOtherUsername} from "$lib/tools/clientTools";
    import {viewConversations, visibleConversations} from "$lib/chat/conversations";
    import {searchQuery} from "$lib/chat/states";
    import {currentUser} from "$lib/chat/user";

    async function applySearch() {
        if($searchQuery == '') visibleConversations.set($viewConversations);
        else{
            visibleConversations.set(
                $viewConversations.filter((entry) => {
                    let otherUsername = getOtherUsername($currentUser, entry.conversationObj.usernames);
                    if(otherUsername === undefined) return false;
                    let res = otherUsername.toLowerCase().includes($searchQuery.toLowerCase());
                    return res;
                })
            );
        }
    }
</script>
<div class="chat-search">
    <input bind:value={$searchQuery} on:input={applySearch} class="chat-search-input" type="text" placeholder="Search chats..." />
</div>