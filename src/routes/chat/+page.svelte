<svelte:head>
    <title>Chats</title>
</svelte:head>
<script lang="ts">
    import type {
        Conversation,
        ConversationEntry,
        ConversationListResponse,
        Message,
        Message_Offer,
        Message_Standard,
        User
    } from "../api/types";
    import {ConversationState, MessageType, UserRole} from "../api/types";
    import {
        archiveConversation,
        getConversations,
        getFileExtension, getFileName,
        getMessages,
        getOtherUsername,
        initConversation,
        openConversation, sendAcceptMessage, sendFileMessage, sendRejectMessage, sendTextMessage
    } from "../clientTools";
    import {onMount} from "svelte";
    import '@fortawesome/fontawesome-free/css/all.min.css'

    export let data;

    let loadingChatPanel = true;
    let loadingChatMessages = false;
    let loadingChatListPanel = false;
    let loadingChatList = true;

    let sendProgress:number = 0;

    let currentUser:User = data.currentUser;

    let conversationData:ConversationListResponse = {conversations:[],lastOpened:undefined};
    let lastOpenedConversation:ConversationEntry | undefined = undefined;
    let viewConversations:ConversationEntry[] = [];
    let visibleConversations:ConversationEntry[] = [];

    let selectedConversation:ConversationEntry | undefined = undefined;

    let chatOpen = false;

    onMount(async () => {
        //Load data
        await fetchData();
    });

    let JOB_updateCourseList;
    async function fetchData() {
        await renderConversationList();
        loadingChatList = false;
        lastOpenedConversation = conversationData.lastOpened;
        let firstSelection = getSelectedConversation();
        if(firstSelection != undefined) await openConversationEntry(getSelectedConversation() as ConversationEntry,true);
        JOB_updateCourseList = setInterval(renderConversationList, 15000);
    }
    let archiveMode = false;
    let noChat = false;
    async function renderConversationList() {
        conversationData = await getConversations(currentUser,searchQuery);
        noChat = false;
        if(conversationData.conversations.length == 0) noChat = true;
        //Archive filter
        setArchiveMode(archiveMode);
        //Search filter
        visibleConversations = viewConversations;
        await applySearch();
    }

    let searchQuery = '';
    async function applySearch() {
        if(searchQuery == '') visibleConversations = viewConversations;
        else{
            visibleConversations = viewConversations.filter((entry) => {
                return getOtherUsername(currentUser,entry.conversationObj.usernames).toLowerCase().includes(searchQuery.toLowerCase())
            });
        }
    }


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

    let JOB_updateMessages:any = undefined;

    async function openConversationEntry(newConversation:ConversationEntry,isAutomatic = false) {
        selectedConversation = newConversation;
        loadingChatPanel = true;
        if(!isAutomatic) chatOpen = true;
        //Load conversation
        await loadMessages();
        if(JOB_updateMessages == undefined) JOB_updateMessages = setInterval(loadMessages, 15000);

        //Set conversation as opened
        let res = await openConversation(selectedConversation.conversationObj._id);
        if(res == false || res.status != 200) {
            showError('An Error occurred while trying to update your chat status');
        }
        insertUnreadBanner();
        scrollChat();
        loadingChatPanel = false;
        //Rerender conversation list
        renderConversationList();
    }

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

    function getSelectedConversation() {
        if(lastOpenedConversation !== undefined) {
            let isContained = viewConversations.filter((entry) => {
                return entry.conversationObj._id === (lastOpenedConversation as ConversationEntry).conversationObj._id;
            }).length >= 1;
            if(isContained) {
                return lastOpenedConversation
            }
            else{
                return viewConversations.length >= 1 ? viewConversations[0] : undefined;
            }
        }
    }

    function displayLastMessage(lastMessage:Message) {
        let type = lastMessage.messageType;
        if(type === MessageType.Standard) {
            let msg_standard:Message_Standard = lastMessage as Message_Standard;
            return msg_standard.text;
        }
        else if(type === MessageType.Offer) {
            let msg_offer:Message_Offer = lastMessage as Message_Offer;
            if(msg_offer.text.length >= 1){
                return msg_offer.text;
            }
            return "New offer";
        }
        else if(type === MessageType.Accept) {
            return "Accepted offer";
        }
        else if(type === MessageType.Reject) {
            return "Rejected offer";
        }
        else if(type === MessageType.File) {
            return "File";
        }
        else{
            return "No message";
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


    let newChatVisible = false;
    let quote_username = '';
    let quote_price = 0;
    let quote_text = '';
    async function sendQuote() {
        let res = await initConversation(currentUser,quote_username,quote_text,quote_price);
        newChatVisible = false;
        if(res == false || res.status != 200) {
            showError('An Error occurred while trying to send your quote. Please try again later.');
        }
        else {
            showSuccess("Your quote has been sent.");
            await renderConversationList();
            let newEntry = await res.json();
            await openConversationEntry(newEntry.data.conversation,true);
        }
        quote_username = '';
        quote_price = 0;
        quote_text = '';
    }

    let error = '';
    async function showError(msg:string) {
        error = msg;
        const duration = 5*1000;
        setTimeout(() => {
            error = '';
        }, duration);
    }

    let success = '';
    async function showSuccess(msg:string) {
        success = msg;
        const duration = 5*1000;
        setTimeout(() => {
            success = '';
        }, duration);
    }

    async function archiveChat() {
        if(selectedConversation) {
            let res = await archiveConversation(selectedConversation?.conversationObj._id);
            if(res == false || res.status != 200) {
                showError('An Error occurred while trying to archive your chat. Please try again later.');
            }
            else{
                showSuccess('Chat archived');
                openConversationEntry(selectedConversation,true);
                chatOpen = false;
            }
        }
    }


    function resetProgressBar() {
        let progbar = document.getElementById('sendprogress')
        if(progbar) {
            progbar.style.display = 'none';
            sendProgress = 0;
            setTimeout(() => {
                (progbar as HTMLElement).style.display = 'block';
            }, 300);
        }
    }

    async function acceptOffer() {
        if(selectedConversation) {
            sendProgress = 10;
            let res = await sendAcceptMessage(currentUser,selectedConversation?.conversationObj._id)
            sendProgress = 80;
            if(res != false && res.status == 200) {
                await loadMessages();
            }
            else{
                showError('An Error occurred while trying to send your message. Please try again later.');
            }
            sendProgress = 100;
            setTimeout(() => {
                resetProgressBar();
            }, 500);
            scrollBottom();
        }
    }

    async function declineOffer() {
        if(selectedConversation) {
            sendProgress = 10;
            let res = await sendRejectMessage(currentUser,selectedConversation?.conversationObj._id);
            sendProgress = 80;
            if(res != false && res.status == 200) {
                await loadMessages();
            }
            else{
                showError('An Error occurred while trying to send your message. Please try again later.');
            }
            sendProgress = 100;
            setTimeout(() => {
                resetProgressBar();
            }, 500);
            scrollBottom();
        }
    }

    let messageField = "";
    async function sendTextMessageRequest() {
        if(messageField == "") return;
        if(currentUser.type === UserRole.ServiceProvider &&
            selectedConversation !== undefined &&
            (
                selectedConversation.conversationObj.state === ConversationState.Quoted ||
                selectedConversation.conversationObj.state === ConversationState.Rejected
            )) {
            return;
        }
        if(selectedConversation) {
            sendProgress = 10;
            let res = await sendTextMessage(currentUser,selectedConversation?.conversationObj._id,messageField);
            sendProgress = 80;
            if(res != false && res.status == 200) {
                await loadMessages();
            }
            else{
                showError('An Error occurred while trying to send your message. Please try again later.');
            }
            messageField = "";
            sendProgress = 100;
            setTimeout(() => {
                resetProgressBar();
            }, 500);
            scrollBottom();
        }
    }

    let fileValue: FileList | null = null;
    async function sendFileMessageRequest() {
        if (fileValue) {
            let file: File | null = fileValue.item(0);
            if (selectedConversation && file != null) {
                sendProgress = 2;
                let updateFileProgress = (progress:number) => {
                    sendProgress = progress;
                }
                let res = await sendFileMessage(currentUser, selectedConversation.conversationObj._id, file,updateFileProgress);
                if(res != false) {
                    await loadMessages();
                    sendProgress = 100;
                } else {
                    showError('An Error occurred while trying to upload you file. Please try again later.');
                }
                resetProgressBar();
            }
        }
    }

</script>
<style>
    @import './style.css';
</style>
{#if chatOpen == true}
    <style>
        @media screen and (max-width: 720px) {
            .chat-container {
                display: block;
                width: 100%;
                left:0;
            }
            .chat-list {
                display: none;
            }
        }
    </style>
{/if}
<div class="page-chats">
    {#if success !== ''}
        <div class="success">{success}</div>
    {/if}
    {#if error !== ''}
        <div class="error">{error}</div>
    {/if}
    {#if newChatVisible}
        <div class="new-chat">
            <div class="new-chat-container">
                <h2>Send Quote</h2>
                <i id="close-newchat" role="button" tabindex="0" on:keydown={() => {newChatVisible = false;}} on:click={() => {newChatVisible = false;}} class="fa-solid fa-xmark"></i>
                <label for="quote-username">Username</label>
                <input bind:value={quote_username} type="text" placeholder="Username" id="quote-username" required>
                <label for="quote-price">Price</label>
                <input bind:value={quote_price} type="number" placeholder="Price" id="quote-price" required>
                <label for="quote-text">Message</label>
                <textarea bind:value={quote_text} id="quote-text" placeholder="Your message..."></textarea>
                <button on:click={sendQuote}>Send Quote</button>
            </div>
        </div>
    {/if}
    <div class="chat-list">
        {#if loadingChatListPanel}
            <div class="loading-screen">
                <span class="jumping-dots">
                    <span class="dot-1"></span>
                    <span class="dot-2"></span>
                    <span class="dot-3"></span>
                </span>
            </div>
        {/if}
        <div class="chats-topbar">
            <h2 class="chats-heading">Chats</h2>
            <div class="topbar-button-wrapper">
                {#if currentUser.type === UserRole.ServiceProvider}
                    <i id="newchat" role="button"  tabindex="0" on:keydown={() => {newChatVisible = true;}} on:click={() => {newChatVisible = true;}} class="fa-regular fa-pen-to-square"></i>
                {/if}
            </div>
        </div>
        <div class="chat-search">
            <input bind:value={searchQuery} on:input={applySearch} class="chat-search-input" type="text" placeholder="Search chats..." />
        </div>
        <div class="chat-wrapper">
            {#if loadingChatList && !loadingChatListPanel}
                <div class="loading-screen">
                <span class="jumping-dots">
                    <span class="dot-1"></span>
                    <span class="dot-2"></span>
                    <span class="dot-3"></span>
                </span>
                </div>
            {/if}
            <div class="chat-wrapper-content">
                {#each visibleConversations as conversation}
                    <div on:click={() => {openConversationEntry(conversation,false)}} on:keydown={() => {openConversationEntry(conversation,false)}} role="button" tabindex="0" class="chat-item {selectedConversation !== undefined ? (conversation.conversationObj._id === selectedConversation.conversationObj._id ? 'chat-item-active' : '') : ''}">
                        <span class="chat-picture">
                            {#if conversation.pictureURL !== ""}
                               <img src="{conversation.pictureURL}" alt="profile-icon">
                            {:else}
                                <img src="/user.png" alt="profile-icon">
                            {/if}
                        </span>
                        <div class="chat-details">
                    <span class="chat-name">
                        {getOtherUsername(currentUser,conversation.conversationObj.usernames)}
                    </span>
                            <span class="chat-last">
                        {displayLastMessage(conversation.lastMessage)}
                    </span>
                            {#if conversation.unreadCount > 0}
                            <span class="chat-unread">
                                {conversation.unreadCount}
                            </span>
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>
        </div>
        <button on:click={() => {setArchiveMode(!archiveMode)}} class="archivebutton {archiveMode ? 'archivebutton-active' : ''}">Archived Chats</button>
    </div>
    <div class="chat-container">
        {#if loadingChatPanel}
            <div class="loading-screen">
                <span class="jumping-dots">
                    <span class="dot-1"></span>
                    <span class="dot-2"></span>
                    <span class="dot-3"></span>
                </span>
            </div>
        {/if}
        {#if noChat}
            <div class="no-chat">
                <span>No conversation availible</span>
            </div>
        {/if}
        <div class="chat-profile">
            <div class="icon-wrapper-back" on:click={() => {chatOpen = false}}><i class="archive-disabled fa-solid fa-angle-left"></i></div>
            <span class="chat-bar-picture">
                <img src="/user.png" alt="profile-icon">
                {#if selectedConversation !== undefined && selectedConversation.pictureURL !== ""}
                   <img src="{selectedConversation.pictureURL}" alt="profile-icon">
                {:else}
                    <img src="/user.png" alt="profile-icon">
                {/if}
            </span>
            <span class="chat-title">{selectedConversation !== undefined ? getOtherUsername(currentUser,selectedConversation.conversationObj.usernames) : ''}</span>
            {#if
                selectedConversation != undefined &&
                (
                    currentUser.type == UserRole.Customer &&
                    (
                        selectedConversation.conversationObj.archived == undefined ||
                        (selectedConversation.conversationObj.archived != undefined && selectedConversation.conversationObj.archived.customer == undefined) ||
                        (selectedConversation.conversationObj.archived != undefined && selectedConversation.conversationObj.archived.customer != undefined && selectedConversation.conversationObj.archived.customer === false)
                    )
                ||
                    currentUser.type == UserRole.ServiceProvider &&
                    (
                        selectedConversation.conversationObj.archived == undefined ||
                        (selectedConversation.conversationObj.archived != undefined && selectedConversation.conversationObj.archived.serviceprovider == undefined) ||
                        (selectedConversation.conversationObj.archived != undefined && selectedConversation.conversationObj.archived.serviceprovider != undefined && selectedConversation.conversationObj.archived.serviceprovider === false)
                    )
                )}
                <div class="icon-wrapper" on:click={archiveChat}><i class="fa-solid fa-box-archive"></i></div>
            {/if}
        </div>
        <div class="chat-history">
            {#if loadingChatMessages && !loadingChatPanel}
                <div class="loading-screen">
                <span class="jumping-dots">
                    <span class="dot-1"></span>
                    <span class="dot-2"></span>
                    <span class="dot-3"></span>
                </span>
                </div>
            {/if}
            <div class="chat-history-content" id="chat-history-content" >
                <div id="top-placeholder"></div>
                {#each messages as message}
                    {#if message.messageType === MessageType.File}
                        {#if ['jpg','jpeg','gif','webp','png'].includes(getFileExtension(message.filePath))}
                            <div class="chat-message message-image {message.sender.username !== currentUser.username ? (message.read == false ? 'message-unread' : '') : ''} {message.sender.username === currentUser.username ? 'message-me' : 'message-other'}">
                                <a href="{message.filePath}" target="_blank">
                                    <div class="message-wrapper">
                                        <img src="{message.filePath}" alt="image message">
                                    </div>
                                </a>
                            </div>
                        {:else}
                            <div class="chat-message message-file {message.sender.username !== currentUser.username ? (message.read == false ? 'message-unread' : '') : ''} {message.sender.username === currentUser.username ? 'message-me' : 'message-other'}">
                                <a href="{message.filePath}" download>
                                    <div class="message-wrapper">
                                        <div class="icon-wrapper">
                                            <i class="fa-regular fa-file"></i>
                                        </div>
                                        <div class="details-wrapper">
                                            <span class="filename">{getFileName(message.filePath)}</span>
                                            <span class="download"><i class="fa-solid fa-cloud-arrow-down"></i>Download</span>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        {/if}
                    {:else if message.messageType === MessageType.Offer}
                        {#if selectedConversation != undefined && (selectedConversation.conversationObj.state === ConversationState.Quoted || selectedConversation.conversationObj.state === ConversationState.Chatting)}
                            {#if message.sender.username === currentUser.username}
                                <div class="chat-message message-quote message-quote-sent {message.sender.username !== currentUser.username ? (message.read == false ? 'message-unread' : '') : ''}">
                                    <div class="message-wrapper">
                                        <span class="price">{message.details.price}€</span>
                                        <span class="status">Pending customer decision</span>
                                        <p class="text">{message.text}</p>
                                        <button disabled class="payment" on:click={() => {window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", '_blank')}}>Collect Payment</button>
                                    </div>
                                </div>
                            {:else}
                                <div class="chat-message message-quote {message.sender.username !== currentUser.username ? (message.read == false ? 'message-unread' : '') : ''}">
                                    <div class="message-wrapper">
                                        <span class="price">{message.details.price}€</span>
                                        <span class="status">Received Quote</span>
                                        <p class="text">{message.text}</p>
                                        <button on:click={acceptOffer} class="accept">Accept Quote</button>
                                        <button on:click={declineOffer} class="decline">Decline Quote</button>
                                    </div>
                                </div>
                            {/if}
                        {:else if selectedConversation != undefined && (selectedConversation.conversationObj.state === ConversationState.Accepted)}
                            {#if message.sender.username === currentUser.username}
                                <div class="chat-message message-quote message-quote-sent {message.sender.username !== currentUser.username ? (message.read == false ? 'message-unread' : '') : ''}">
                                    <div class="message-wrapper">
                                        <span class="price">{message.details.price}€</span>
                                        <span class="status">Accepted Quote</span>
                                        <p class="text">{message.text}</p>
                                        <button disabled class="payment" on:click={() => {window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", '_blank')}}>Collect Payment</button>
                                    </div>
                                </div>
                            {:else}
                                <div class="chat-message message-quote message-quote-sent message-quote-sent-customer {message.sender.username !== currentUser.username ? (message.read == false ? 'message-unread' : '') : ''}">
                                    <div class="message-wrapper">
                                        <span class="price">{message.details.price}€</span>
                                        <span class="status">Accepted Quote</span>
                                        <p class="text">{message.text}</p>
                                        <button class="payment" on:click={() => {window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", '_blank')}}>Send Payment</button>
                                    </div>
                                </div>
                            {/if}
                        {:else if selectedConversation != undefined && (selectedConversation.conversationObj.state === ConversationState.Rejected)}
                            {#if message.sender.username === currentUser.username}
                                <div class="chat-message message-quote message-quote-sent {message.sender.username !== currentUser.username ? (message.read == false ? 'message-unread' : '') : ''}">
                                    <div class="message-wrapper">
                                        <span class="price">{message.details.price}€</span>
                                        <span class="status">Rejected Quote</span>
                                        <p class="text">{message.text}</p>
                                        <button disabled class="payment" on:click={() => {window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", '_blank')}}>Collect Payment</button>
                                    </div>
                                </div>
                            {:else}
                                <div class="chat-message message-quote message-quote-sent message-quote-sent-customer {message.sender.username !== currentUser.username ? (message.read == false ? 'message-unread' : '') : ''}">
                                    <div class="message-wrapper">
                                        <span class="price">{message.details.price}€</span>
                                        <span class="status">Rejected Quote</span>
                                        <p class="text">{message.text}</p>
                                        <button disabled class="payment" on:click={() => {window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", '_blank')}}>Send Payment</button>
                                    </div>
                                </div>
                            {/if}
                        {:else}
                            <div class="chat-message {message.sender.username !== currentUser.username ? (message.read == false ? 'message-unread' : '') : ''} {message.sender.username === currentUser.username ? 'message-me' : 'message-other'}">
                                <div class="message-wrapper">Unable to load message</div>
                            </div>
                        {/if}

                    {:else if message.messageType === MessageType.Accept}
                        <div class="chat-message message-accept {message.sender.username !== currentUser.username ? (message.read == false ? 'message-unread' : '') : ''} {message.sender.username === currentUser.username ? 'message-me' : 'message-other'}">
                            <div class="message-wrapper">
                                <div class="icon-wrapper">
                                    <i class="fa-regular fa-circle-check"></i>
                                </div>
                                <div class="details-wrapper">
                                    <span class="heading">Accepted</span>
                                    <span class="status">The quote has been accepted</span>
                                </div>
                            </div>
                        </div>
                    {:else if message.messageType === MessageType.Reject}
                        <div class="chat-message message-decline {message.sender.username !== currentUser.username ? (message.read == false ? 'message-unread' : '') : ''} {message.sender.username === currentUser.username ? 'message-me' : 'message-other'}">
                            <div class="message-wrapper">
                                <div class="icon-wrapper">
                                    <i class="fa-regular fa-circle-xmark"></i>
                                </div>
                                <div class="details-wrapper">
                                    <span class="heading">Declined</span>
                                    <span class="status">The quote has been declined</span>
                                </div>
                            </div>
                        </div>
                    {:else if message.messageType === MessageType.Standard}
                        <div class="chat-message {message.sender.username !== currentUser.username ? (message.read == false ? 'message-unread' : '') : ''} {message.sender.username === currentUser.username ? 'message-me' : 'message-other'}">
                            <div class="message-wrapper">{message.text}</div>
                        </div>
                    {/if}
                {/each}
            </div>
        </div>
        <div class="chat-editor">
            <div id="sendprogress" class="sendprogress" style="width: {sendProgress}%"></div>
            {#if
                currentUser.type === UserRole.ServiceProvider &&
                selectedConversation !== undefined &&
                (
                    selectedConversation.conversationObj.state === ConversationState.Quoted ||
                    selectedConversation.conversationObj.state === ConversationState.Rejected
                )}
                <div class="icon-wrapper" style="filter: brightness(80%)">
                    <i class="fa-regular fa-file"></i>
                    <input disabled bind:files={fileValue} on:change={sendFileMessageRequest} class="input-file" id="fileInput" type="file">
                </div>
            {:else}
                <div class="icon-wrapper">
                    <i class="fa-regular fa-file"></i>
                    <input bind:files={fileValue} on:change={sendFileMessageRequest} class="input-file" id="fileInput" type="file">
                </div>
            {/if}
            {#if
                currentUser.type === UserRole.ServiceProvider &&
                selectedConversation !== undefined &&
                (
                    selectedConversation.conversationObj.state === ConversationState.Quoted ||
                    selectedConversation.conversationObj.state === ConversationState.Rejected
                )}
                <input disabled bind:value={messageField} class="send-message-input" type="text" placeholder="Messaging deactivated..." />
                <div style="filter: grayscale(1)" class="icon-wrapper-send"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="paper-plane"><path fill="#ffffff" d="M20.34,9.32l-14-7a3,3,0,0,0-4.08,3.9l2.4,5.37h0a1.06,1.06,0,0,1,0,.82l-2.4,5.37A3,3,0,0,0,5,22a3.14,3.14,0,0,0,1.35-.32l14-7a3,3,0,0,0,0-5.36Zm-.89,3.57-14,7a1,1,0,0,1-1.35-1.3l2.39-5.37A2,2,0,0,0,6.57,13h6.89a1,1,0,0,0,0-2H6.57a2,2,0,0,0-.08-.22L4.1,5.41a1,1,0,0,1,1.35-1.3l14,7a1,1,0,0,1,0,1.78Z"></path></svg></div>
            {:else}
                <input bind:value={messageField} on:keydown={(event) => {if(event.key === 'Enter'){sendTextMessageRequest();}}} class="send-message-input" type="text" placeholder="Your message..." />
                <div on:click={sendTextMessageRequest} class="icon-wrapper-send"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="paper-plane"><path fill="#ffffff" d="M20.34,9.32l-14-7a3,3,0,0,0-4.08,3.9l2.4,5.37h0a1.06,1.06,0,0,1,0,.82l-2.4,5.37A3,3,0,0,0,5,22a3.14,3.14,0,0,0,1.35-.32l14-7a3,3,0,0,0,0-5.36Zm-.89,3.57-14,7a1,1,0,0,1-1.35-1.3l2.39-5.37A2,2,0,0,0,6.57,13h6.89a1,1,0,0,0,0-2H6.57a2,2,0,0,0-.08-.22L4.1,5.41a1,1,0,0,1,1.35-1.3l14,7a1,1,0,0,1,0,1.78Z"></path></svg></div>
            {/if}
        </div>
    </div>
</div>