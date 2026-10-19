<!-- Component：资源卡片 -->
<script setup>
import { computed } from 'vue';
import { formatSize, formatDate, parseTags } from '../utils/format';
import { typeLabel } from '../mock/resources';

const props = defineProps({
    resource: { type: Object, required: true },
    // 是否为当前登录用户上传的资源（决定编辑/删除/分享切换按钮是否显示）
    owned: { type: Boolean, default: false }
});

const emit = defineEmits(['open', 'download', 'delete', 'toggleShare']);

const tags = computed(() => parseTags(props.resource.tags));
const shared = computed(() => props.resource.visibility === 1);
</script>

<template>
    <div class="card" @click="emit('open', resource)">
        <div class="card-top">
            <span class="badge badge-type">{{ typeLabel(resource.resource_type) }}</span>
            <span class="badge" :class="shared ? 'badge-shared' : 'badge-private'">
                {{ shared ? '已分享' : '私有' }}
            </span>
            <span v-if="owned" class="badge">我的</span>
        </div>

        <h4 class="card-title">{{ resource.title }}</h4>
        <p class="card-desc">{{ resource.description || '（暂无描述）' }}</p>

        <div v-if="tags.length" class="card-tags">
            <span v-for="t in tags" :key="t" class="tag-chip">#{{ t }}</span>
        </div>

        <div class="card-meta">
            <span>{{ resource.uploader_name || '匿名' }}</span>
            <span>·</span>
            <span>{{ formatDate(resource.created_at) }}</span>
            <span>·</span>
            <span>{{ formatSize(resource.file_size) }}</span>
            <span class="dl-count">⬇ {{ resource.download_count || 0 }}</span>
        </div>

        <div class="card-actions" @click.stop>
            <button class="btn btn-sm btn-primary" @click="emit('download', resource)">下载</button>

            <template v-if="owned">
                <button class="btn btn-sm" @click="emit('toggleShare', resource)">
                    {{ shared ? '设为私有' : '公开分享' }}
                </button>
                <button class="btn btn-sm btn-danger" @click="emit('delete', resource)">删除</button>
            </template>
        </div>
    </div>
</template>

<style scoped>
.card {
    display: flex;
    flex-direction: column;
    background: #fff;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    padding: 16px;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s;
}

.card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(31, 41, 51, 0.12);
}

.card-top {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 10px;
}

.card-title {
    margin-bottom: 8px;
    font-size: 15px;
    font-weight: 600;
    line-height: 1.4;
}

.card-desc {
    flex: 1;
    margin-bottom: 10px;
    font-size: 13px;
    color: var(--text-soft);
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.card-tags {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 10px;
}

.card-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--text-soft);
    margin-bottom: 12px;
}

.dl-count {
    margin-left: auto;
}

.card-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}
</style>
