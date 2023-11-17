<script lang="ts">
    import {searchQuery} from "$lib/chat/states";
</script>
<style>
    .chat-search {
        display: block;
        position: relative;
        width: calc(100% - 32px);
        height: 30px;
        border: 1px solid rgba(0,0,0,0.1);
        margin-left: 15px;
        margin-right: 15px;
        margin-top: 5px;
        margin-bottom: 15px;
        border-radius: 6px;
    }

    .chat-search-input {
        display: block;
        position: relative;
        width: calc(100% - 15px);
        height: 30px;
        padding-left: 10px;
        border: none;
        background: transparent;
        border-radius: 6px;
    }

    .chat-search-input:focus {
        outline: none !important;
    }
</style>
<div class="chat-search">
    <input bind:value={$searchQuery} class="chat-search-input" type="text" placeholder="Search chats..." />
</div>