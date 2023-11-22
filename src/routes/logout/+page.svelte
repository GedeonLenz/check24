<svelte:head>
    <title>Logout</title>
</svelte:head>
<script lang="ts">
    import {goto} from "$app/navigation";
    import {currentUser} from "$lib/chat/user";
    currentUser.set(undefined);
    goto('/login')
</script>
<span>Logging out...</span>
