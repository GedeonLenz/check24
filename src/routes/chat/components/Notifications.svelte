<script lang="ts">
    let error = '';
    async function showError(msg:string) {
        error = msg;
        const duration = 5*1000;
        setTimeout(() => {
            error = '';
        }, duration);
    }

    let success = '';
    async function showSuccess(msg:string) {
        success = msg;
        const duration = 5*1000;
        setTimeout(() => {
            success = '';
        }, duration);
    }
</script>
{#if success !== ''}
    <div class="success">{success}</div>
{/if}
{#if error !== ''}
    <div class="error">{error}</div>
{/if}