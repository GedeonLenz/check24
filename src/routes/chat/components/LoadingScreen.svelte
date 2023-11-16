<script lang="ts">
    export let visible:boolean;
</script>
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