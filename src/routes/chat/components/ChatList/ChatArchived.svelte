<script lang="ts">
    import {UserRole} from "$lib/types";

    let archiveMode = false;
    function setArchiveMode(showArchive:boolean) {
        archiveMode = showArchive;
        if(showArchive) {
            viewConversations = conversationData.conversations.filter(
                conversation =>
                    currentUser.type == UserRole.ServiceProvider ?
                        conversation.conversationObj.archived?.serviceprovider === true
                        :
                        conversation.conversationObj.archived?.customer === true
            );
        }
        else{
            viewConversations = conversationData.conversations.filter(
                conversation =>
                    currentUser.type == UserRole.ServiceProvider ?
                        conversation.conversationObj.archived?.serviceprovider != true
                        :
                        conversation.conversationObj.archived?.customer != true
            );
        }
        visibleConversations = viewConversations;
        searchQuery = '';
    }
</script>
<button on:click={() => {setArchiveMode(!archiveMode)}} class="archivebutton {archiveMode ? 'archivebutton-active' : ''}">Archived Chats</button>