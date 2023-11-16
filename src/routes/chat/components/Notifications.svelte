<script lang="ts">
    import {startNotificationListener} from "$lib/chat/notifications";
    import {success, error} from "$lib/chat/notifications";
    startNotificationListener();
</script>
{#if $success !== false}
    <div class="success">{success}</div>
{/if}
{#if $error !== false}
    <div class="error">{error}</div>
{/if}