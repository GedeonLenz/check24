<svelte:head>
    <title>Logout</title>
</svelte:head>
<script lang="ts">
    import {goto} from "$app/navigation";
    goto('/login')
</script>
<span>Logging out...</span>
