<!-- View：资源详情 -->
<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import EmptyState from '../components/EmptyState.vue';
import { MOCK_RESOURCES } from '../mock/resources';
import { typeLabel } from '../mock/resources';
import { formatSize, formatDate, parseTags } from '../utils/format';

const route = useRoute();
const router = useRouter();

const resource = ref(null);
const loading = ref(true);

// 后端暂无详情接口，这里从 mock 数据中查找
onMounted(() => {
    const id = Number(route.params.id);
    resource.value = MOCK_RESOURCES.find(r => r.id === id) || null;
    loading.value = false;
});

const tags = computed(() => (resource.value ? parseTags(resource.value.tags) : []));

// 根据资源类型返回不同的预览形态
const previewKind = computed(() => {
    if (!resource.value) return 'none';
    const t = resource.value.resource_type;
    if (t === 'image') return 'image';
    if (t === 'audio') return 'audio';
    if (t === 'video') return 'video';
    return 'doc';
});

// 相关推荐：同类型的其他公开资源
const related = computed(() =>
    MOCK_RESOURCES.filter(
        r => resource.value && r.id !== resource.value.id && r.resource_type === resource.value.resource_type && r.visibility === 1
    ).slice(0, 4)
);

function openResource(r) {
    router.push(`/resource/${r.id}`);
}

function handleDownload() {
    // TODO: 后端补齐下载接口后替换为真实请求
    alert('下载功能开发中');
}
</script>

<template>
    <div class="page">
        <div class="container">
            <div v-if="loading" class="empty">加载中…</div>

            <EmptyState v-else-if="!resource" icon="🫥" text="资源不存在或已被删除">
                <RouterLink to="/" class="btn btn-sm">返回广场</RouterLink>
            </EmptyState>

            <template v-else>
                <button class="btn btn-sm back-btn" @click="router.back()">← 返回</button>

                <div class="panel detail-card">
                    <div class="detail-top">
                        <span class="badge badge-type">{{ typeLabel(resource.resource_type) }}</span>
                        <span class="badge" :class="resource.visibility === 1 ? 'badge-shared' : 'badge-private'">
                            {{ resource.visibility === 1 ? '已公开分享' : '未分享（仅自己可见）' }}
                        </span>
                    </div>

                    <h2 class="detail-title">{{ resource.title }}</h2>

                    <div class="detail-meta">
                        <span><b>{{ resource.uploader_name }}</b> 上传</span>
                        <span>·</span>
                        <span>{{ formatDate(resource.created_at) }}</span>
                        <span>·</span>
                        <span>大小 {{ formatSize(resource.file_size) }}</span>
                        <span>·</span>
                        <span>⬇ 已被下载 {{ resource.download_count }} 次</span>
                    </div>

                    <div v-if="tags.length" class="card-tags detail-tags">
                        <RouterLink v-for="t in tags" :key="t" :to="`/search?q=${encodeURIComponent(t)}`" class="tag-chip">
                            #{{ t }}
                        </RouterLink>
                    </div>

                    <div class="detail-desc">{{ resource.description }}</div>

                    <h3 class="section-title">文件预览</h3>
                    <div class="preview-box">
                        <div v-if="previewKind === 'none'" class="hint">暂无预览</div>
                        <div v-else-if="previewKind === 'doc'" class="preview-doc">
                            <div class="doc-head">📄 {{ resource.file_name }}</div>
                            <div class="doc-body">文档类资源暂不支持在线预览，可下载后查看。</div>
                        </div>
                        <div v-else class="preview-media-hint">
                            🖼️ 资源预览图
                            <div class="hint">真实环境的图片预览将在接入资源 URL 后展示</div>
                        </div>
                    </div>

                    <div class="detail-actions">
                        <button class="btn btn-primary" @click="handleDownload">⬇ 下载资源</button>
                    </div>
                </div>

                <template v-if="related.length">
                    <h3 class="section-title">相关推荐</h3>
                    <div class="grid">
                        <div v-for="r in related" :key="r.id" class="related-card" @click="openResource(r)">
                            <span class="badge badge-type">{{ typeLabel(r.resource_type) }}</span>
                            <div class="related-title">{{ r.title }}</div>
                            <div class="related-sub">⬇ {{ r.download_count }}</div>
                        </div>
                    </div>
                </template>
            </template>
        </div>
    </div>
</template>

<style scoped>
.back-btn {
    margin-bottom: 12px;
}

.detail-top {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
}

.detail-title {
    margin-bottom: 10px;
    font-size: 22px;
    line-height: 1.4;
}

.detail-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    font-size: 13px;
    color: var(--text-soft);
    margin-bottom: 14px;
}

.detail-tags {
    margin-bottom: 14px;
}

.detail-desc {
    font-size: 14px;
    line-height: 1.8;
    white-space: pre-wrap;
    color: var(--text);
}

.preview-box {
    margin-top: 8px;
    padding: 20px;
    background: #f7f8fb;
    border: 1px solid var(--border);
    border-radius: 10px;
    min-height: 160px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.preview-media-hint {
    text-align: center;
    font-size: 20px;
    color: var(--text-soft);
}

.preview-doc {
    width: 100%;
}

.doc-head {
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 600;
}

.doc-body {
    font-size: 13px;
    color: var(--text-soft);
}

.hint {
    margin-top: 6px;
    font-size: 12px;
    color: #a0a5ad;
}

.detail-actions {
    display: flex;
    gap: 10px;
    margin-top: 20px;
}

.related-card {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 14px;
    cursor: pointer;
    transition: transform 0.15s;
}

.related-card:hover {
    transform: translateY(-2px);
}

.related-title {
    margin: 8px 0 4px;
    font-size: 14px;
    font-weight: 500;
}

.related-sub {
    font-size: 12px;
    color: var(--text-soft);
}
</style>
