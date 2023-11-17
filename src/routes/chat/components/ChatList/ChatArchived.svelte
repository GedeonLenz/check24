<script lang="ts">
    import {archiveMode} from "$lib/chat/states";
</script>
<button on:click={() => {archiveMode.set(!$archiveMode)}} class="archivebutton {$archiveMode ? 'archivebutton-active' : ''}">Archived Chats</button>