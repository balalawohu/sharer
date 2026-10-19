<!-- Component：普通列表（一次性全量渲染）
     作用：作为虚拟列表的性能对照组。
     数据量上万时会一次性创建全部 DOM 节点，能直观感受卡顿感，
     不建议在生产环境的大数据量场景下使用。
-->
<script setup>
defineProps({
    items: { type: Array, default: () => [] }
});
</script>

<template>
    <div class="normal-list">
        <div v-for="(item, index) in items" :key="item.id || index" class="normal-row">
            <slot :item="item" :index="index" />
        </div>
        <div v-if="!items.length" class="empty">暂无数据</div>
    </div>
</template>

<style scoped>
.normal-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.normal-row {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
}

.empty {
    padding: 40px;
    text-align: center;
    color: var(--text-soft);
}
</style>
