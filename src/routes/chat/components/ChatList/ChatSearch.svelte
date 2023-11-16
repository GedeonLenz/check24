<script lang="ts">
    import {getOtherUsername} from "$lib/tools/clientTools";

    let searchQuery = '';
    async function applySearch() {
        if(searchQuery == '') visibleConversations = viewConversations;
        else{
            visibleConversations = viewConversations.filter((entry) => {
                return getOtherUsername(currentUser,entry.conversationObj.usernames).toLowerCase().includes(searchQuery.toLowerCase())
            });
        }
    }
</script>
<div class="chat-search">
    <input bind:value={searchQuery} on:input={applySearch} class="chat-search-input" type="text" placeholder="Search chats..." />
</div>