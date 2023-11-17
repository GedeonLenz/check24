<script lang="ts">
    import {searchQuery} from "$lib/chat/states";
</script>
<div class="chat-search">
    <input bind:value={$searchQuery} class="chat-search-input" type="text" placeholder="Search chats..." />
</div>