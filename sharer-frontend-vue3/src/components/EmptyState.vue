<!-- Component：空状态占位 -->
<script setup>
defineProps({
    icon: { type: String, default: '📭' },
    text: { type: String, default: '暂无数据' }
});
</script>

<template>
    <div class="empty">
        <div class="empty-icon">{{ icon }}</div>
        <p>{{ text }}</p>
        <slot />
    </div>
</template>
