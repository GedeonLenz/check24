<script lang="ts">
    import {type ConversationEntry, MessageType, type User} from "$lib/types.js";
    import MessageAccept from "../ChatContainer/ChatHistory/Messages/MessageAccept.svelte";
    import LoadingScreen from "../LoadingScreen.svelte";
    import MessageStandard from "../ChatContainer/ChatHistory/Messages/MessageStandard.svelte";
    import MessageFile from "../ChatContainer/ChatHistory/Messages/MessageFile.svelte";
    import MessageReject from "../ChatContainer/ChatHistory/Messages/MessageReject.svelte";
    import MessageQuote from "../ChatContainer/ChatHistory/Messages/MessageQuote.svelte";
    import type {Message} from "$lib/types.js";
    import {getMessages} from "$lib/tools/clientTools";

    export let currentUser:User;
    export let selectedConversation:ConversationEntry | undefined
    export let messages:Message[];

    let messages:Message[] = [];
    async function loadMessages(){
        if(selectedConversation != undefined) {
            let before=messages.length;
            let res = await getMessages(selectedConversation.conversationObj._id);
            if(res == false || res.status != 200) {
                showError('Failed to load conversation!');
            }
            else{
                messages = (await res.json()).data.messages;
                if (messages.length > before) {
                    scrollBottom();
                }
            }
        }
    }

    function scrollChat() {
        const chatHistoryContent = document.getElementById('chat-history-content');
        const unreadBanner = document.getElementById('unread-banner');
        if(chatHistoryContent){
            if (unreadBanner) {
                unreadBanner.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                scrollBottom(false);
            }
        }
    }

    function scrollBottom(smooth=true) {
        let container = document.getElementById('chat-history-content');
        if(container) {
            container.scrollTo({
                top: container.scrollHeight,
                behavior: smooth? 'smooth' : 'instant'
            });
        }
    }

    function insertUnreadBanner() {
        const container = document.getElementById('chat-history-content');
        if(container == null) return;
        const prevBanner = container.querySelector('.unread-banner');
        if(prevBanner){

            if(prevBanner.classList.contains('first-message')) {
                const tempContainer = document.createElement('div');
                tempContainer.innerHTML = '<div id="top-placeholder"></div>'
                container.insertBefore(tempContainer.firstChild as ChildNode, prevBanner);
            }
            prevBanner.remove();
        }
        const firstUnreadElement = container.querySelector('.message-unread');
        if (firstUnreadElement) {
            const groupElements = document.querySelectorAll('.chat-message');
            const isFirstMessage = Array.from(groupElements).indexOf(firstUnreadElement as Element) === 0;

            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = '<div class="chat-message unread-banner" id="unread-banner"><span>Unread messages</span></div>'
            if(isFirstMessage) tempContainer.innerHTML = '<div class="chat-message unread-banner first-message"><span>Unread messages</span></div>'
            container.insertBefore(tempContainer.firstChild as ChildNode, firstUnreadElement);

            if (isFirstMessage) {
                let placeholder = document.getElementById('top-placeholder')
                if(placeholder) placeholder.remove();
            }
        }
    }
</script>

<div class="chat-history">
    <div class="chat-history-content" id="chat-history-content" >
        <div id="top-placeholder"></div>
        {#each messages as message}
            {#if message.messageType === MessageType.File}
                <MessageFile currentUser={currentUser} message={message}></MessageFile>
            {:else if message.messageType === MessageType.Offer}
                <MessageQuote currentUser={currentUser} message={message} selectedConversation={selectedConversation}></MessageQuote>
            {:else if message.messageType === MessageType.Accept}
                <MessageAccept currentUser={currentUser} message={message}></MessageAccept>
            {:else if message.messageType === MessageType.Reject}
                <MessageReject currentUser={currentUser} message={message}></MessageReject>
            {:else if message.messageType === MessageType.Standard}
                <MessageStandard currentUser={currentUser} message={message}></MessageStandard>
            {/if}
        {/each}
    </div>
</div>