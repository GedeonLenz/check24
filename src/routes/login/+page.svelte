<svelte:head>
    <title>Login</title>
</svelte:head>
<script lang="ts">
    import { goto } from "$app/navigation";
    let username = "";
    let password = "";
    async function authenticate() {
        const res = await fetch('/api/auth', {
            method: 'POST',
            body: JSON.stringify({
                username,
                password
            })
        })
        let response = await res.json()
        return response.success === true
    }

    async function login() {
        const res = await authenticate();
        if(res) {
            //Redirect after login
            await goto('/chat')
        }
        else{
            showError();
        }
    }

    let isError = false;
    function showError() {
        isError = true;
    }

</script>
<span style="display: {isError ? 'block' : 'none'}" id="loginerror">ERROR: Login failed</span>
<input bind:value={username} name="email" type="email" required  placeholder="Email"/>
<input bind:value={password} name="password"  type="password" required placeholder="Password"/>
<button on:click={() => {login()}} type="submit">Sign in</button>
