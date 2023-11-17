<script lang="ts">
    import {success, error} from "$lib/chat/notifications";
</script>
{#if $success !== false}
    <div class="success">{success}</div>
{/if}
{#if $error !== false}
    <div class="error">{error}</div>
{/if}