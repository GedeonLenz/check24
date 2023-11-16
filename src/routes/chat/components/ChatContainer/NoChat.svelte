<script lang="ts">
    export let visible: boolean = false;
</script>
<style>
    .no-chat {
        display: block;
        position: absolute;
        width: calc(100% - 2px);
        height: 100%;
        z-index: 99999;
        background: #ffffff;
        margin-left:1px;
        margin-right:1px;
    }
    .no-chat span {
        display: block;
        position: relative;
        width: 100%;
        text-align: center;
        top:50%;
        transform: translateY(-50%);
        font-family: "Helvetica Neue","Arial",sans-serif;
        font-size: 15px;
        font-weight: 600;
        color: var(--base-color);
    }
</style>
<div class="no-chat" style="display: {visible ? 'block' : 'none'}">
    <span>No conversation selected</span>
</div>