<script lang="ts">
    export let visible:boolean;
</script>
<style>
    .loading-screen {
        display: block;
        position: absolute;
        width: calc(100% - 2px);
        height: 100%;
        z-index: 9999;
        background: #ffffff;
        margin-left:1px;
        margin-right:1px;
    }

    .jumping-dots {
        display: block;
        position: relative;
        width: 56px !important;
        height: 15px;
        left:50%;
        top:50%;
        transform: translate(-50%,-50%);
    }

    .jumping-dots span {
        position: relative;
        margin-left: auto;
        margin-right: auto;
        animation: jump 1s infinite;
        display: inline-block;
    }

    .jumping-dots .dot-1,.jumping-dots .dot-2, .jumping-dots .dot-3  {
        background-color: var(--animation-dots);
        width: 12px;
        height: 12px;
        border-radius: 50%;
        margin-right: 3px;
        animation-delay: 200ms;
    }

    .jumping-dots .dot-1 {
        animation-delay: 200ms;
    }

    .jumping-dots .dot-2 {
        animation-delay: 400ms;
    }

    .jumping-dots .dot-3 {
        animation-delay: 600ms;
    }

    @keyframes jump {
        0% {
            bottom: 0;
        }
        20% {
            bottom: 5px;
        }
        40% {
            bottom: 0;
        }
    }
</style>
{#if visible}
    <div class="loading-screen">
        <span class="jumping-dots">
            <span class="dot-1"></span>
            <span class="dot-2"></span>
            <span class="dot-3"></span>
        </span>
    </div>
{/if}
```