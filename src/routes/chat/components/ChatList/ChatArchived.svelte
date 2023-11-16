<script lang="ts">
    import {UserRole} from "$lib/types";
    import {archiveMode, searchQuery} from "$lib/chat/states";
    import {conversations, viewConversations, visibleConversations} from "$lib/chat/conversations";
    import {currentUser} from "$lib/chat/user";

    function startArchiveListener() {
        archiveMode.subscribe((archiveMode) => {
            if(archiveMode) {
                    viewConversations.set($conversations.filter(
                        conversation =>
                            $currentUser !== undefined && $currentUser.type == UserRole.ServiceProvider ?
                                conversation.conversationObj.archived?.serviceprovider === true
                                :
                                conversation.conversationObj.archived?.customer === true
                    ));
                }
                else{
                    viewConversations.set(
                        $conversations.filter(
                            (conversation) => {
                                $currentUser !== undefined && $currentUser.type == UserRole.ServiceProvider ?
                                    conversation.conversationObj.archived?.serviceprovider != true
                                    :
                                    conversation.conversationObj.archived?.customer != true
                            })
                    );
                    visibleConversations.set($viewConversations);
                    searchQuery.set('');
            }
        });
    }
</script>
<button on:click={() => {archiveMode.set(!$archiveMode)}} class="archivebutton {$archiveMode ? 'archivebutton-active' : ''}">Archived Chats</button>