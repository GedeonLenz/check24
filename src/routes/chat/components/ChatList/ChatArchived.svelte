<script lang="ts">
    import {archiveMode} from "$lib/chat/states";
</script>
<style>
    .archivebutton{
        display: block;
        position: relative;
        width: 100%;
        height: 53px;
        border: none;
        background: #ffffff;
        font-family: "Helvetica Neue","Arial",sans-serif;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        border-top: 1px solid var(--border-color);
    }
    .archivebutton-active{
        background: var(--button-color);
        color: #ffffff;
        border:none;
    }
</style>
<button on:click={() => {archiveMode.set(!$archiveMode)}} class="archivebutton {$archiveMode ? 'archivebutton-active' : ''}">Archived Chats</button>