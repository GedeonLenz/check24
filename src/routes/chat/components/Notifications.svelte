<script lang="ts">
    import {success, error} from "$lib/chat/notifications";
</script>
<style>
    .error, .success {
        display: block;
        position: fixed;
        top: 20px;
        width: auto;
        max-width: 80vw;
        height: auto;
        padding: 10px 15px;
        color: #ffffff;
        border-radius: 100px;
        background: rgba(255,0,0,1);
        z-index: 9999999;
        left: 50%;
        transform: translateX(-50%);
        font-family: "Helvetica Neue","Arial",sans-serif;
        font-size: 15px;
        font-weight: 500;
    }

    .success {
        background: rgba(133, 184, 23,1);
    }

    @media screen and (max-width: 885px) {
        .error, .success {
            width: 85% !important;
            max-width: 85% !important;
            border-radius: 10px !important;
            text-align: center !important;
        }
    }
</style>
{#if $success !== false}
    <div class="success">{success}</div>
{/if}
{#if $error !== false}
    <div class="error">{error}</div>
{/if}