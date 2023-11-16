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
<style>
    @import './style.css';
</style>
<div class="login">
    <div class="login-pane">
        <span style="display: {isError ? 'block' : 'none'}" id="loginerror">Your username or password seems to be incorrect</span>
        <h1>Login</h1>
        <div class="input-wrapper">
            <span class="greeting">Welcome! Please login to access your chats</span>
            <input bind:value={username} name="username" type="text" required  placeholder="Username"/>
            <input bind:value={password} name="password"  type="password" required placeholder="Password"/>
            <button on:click={() => {login()}} type="submit">Sign in</button>
        </div>
    </div>
    <img class="chat-icon" src="/loginchaticon.png" alt="chat icon">
</div>
