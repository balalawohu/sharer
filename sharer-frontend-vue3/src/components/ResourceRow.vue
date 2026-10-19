<!-- Component：资源列表行（供虚拟列表 / 普通列表共用）
     注意：行高必须固定，与 VirtualList 的 itemHeight 保持一致
-->
<script setup>
import { typeLabel } from '../mock/resources';
import { parseTags, formatSize } from '../utils/format';

defineProps({
    item: { type: Object, required: true },
    index: { type: Number, default: 0 }
});
</script>

<template>
    <div class="list-row">
        <div class="row-index">{{ index + 1 }}</div>

        <div class="row-main">
            <div class="row-title">{{ item.title }}</div>
            <div class="row-meta">
                <span class="badge badge-type">{{ typeLabel(item.resource_type) }}</span>
                <span>{{ item.uploader_name }}</span>
                <span>·</span>
                <span>{{ item.created_at }}</span>
                <span>·</span>
                <span>{{ formatSize(item.file_size) }}</span>
            </div>
            <div class="row-tags">
                <span v-for="t in parseTags(item.tags)" :key="t" class="tag-chip">#{{ t }}</span>
            </div>
        </div>

        <div class="row-stat">
            <div>⬇ {{ item.download_count }}</div>
            <div class="view">👀 {{ item.view_count }}</div>
        </div>
    </div>
</template>

<style scoped>
/* 高度占满外层行容器，具体的 96px 由 VirtualList 控制 */
.list-row {
    display: flex;
    align-items: center;
    gap: 14px;
    height: 100%;
    padding: 12px 14px;
    background: #fff;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    cursor: pointer;
    transition: border-color 0.15s, transform 0.15s;
    overflow: hidden;
}

.list-row:hover {
    border-color: var(--primary);
    transform: translateX(2px);
}

.row-index {
    width: 42px;
    flex-shrink: 0;
    font-size: 13px;
    color: #a0a5ad;
    text-align: center;
}

.row-main {
    flex: 1;
    min-width: 0;
}

.row-title {
    font-size: 14px;
    font-weight: 500;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.row-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 4px;
    font-size: 12px;
    color: var(--text-soft);
    overflow: hidden;
    white-space: nowrap;
}

.row-tags {
    display: flex;
    gap: 6px;
    margin-top: 4px;
    overflow: hidden;
}

.row-stat {
    flex-shrink: 0;
    text-align: right;
    font-size: 12px;
    color: var(--text-soft);
}

.row-stat .view {
    margin-top: 2px;
}
</style>
