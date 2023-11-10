<svelte:head>
    <title>Chats</title>
</svelte:head>
<script lang="ts">
    let response1:string = "";
    async function test_sendMessage() {

    }

    let response2:string = "";
    async function test_receiveMessages() {

    }

    let response3:string = "";
    async function test_initConversation() {

    }

    let response4:string = "";
    async function tet_listConversations() {

    }
</script>


<button on:click={
    () => {
        test_initConversation()
        .then(() => {
            console.log("Send message:");
            console.log(response1);
        });
    }
}>Send message</button>
<button on:click={
    () => {
        test_initConversation()
        .then(() => {
            console.log("Receive messages:");
            console.log(response2);
        });
    }
}>Receive messages</button>

<button on:click={
    () => {
        test_initConversation()
        .then(() => {
            console.log("Init conversation:");
            console.log(response3);
        });
    }
}>Init conversation</button>
<button on:click={
    () => {
        test_initConversation()
        .then(() => {
            console.log("List conversations:");
            console.log(response4);
        });
    }
}>List conversation</button>