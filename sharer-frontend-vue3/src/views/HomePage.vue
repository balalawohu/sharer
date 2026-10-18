<!-- View：资源广场（首页） -->
<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import ResourceCard from '../components/ResourceCard.vue';
import EmptyState from '../components/EmptyState.vue';
import { MOCK_RESOURCES, RESOURCE_TYPES } from '../mock/resources';
import { parseTags } from '../utils/format';

const router = useRouter();

const filterType = ref('all');

const TABS = [{ value: 'all', label: '全部' }, ...RESOURCE_TYPES];

// 广场只展示公开分享的资源
const sharedResources = computed(() => MOCK_RESOURCES.filter(r => r.visibility === 1));

const list = computed(() =>
    filterType.value === 'all'
        ? sharedResources.value
        : sharedResources.value.filter(r => r.resource_type === filterType.value)
);

// 顶部统计
const stats = computed(() => ({
    total: sharedResources.value.length,
    uploaders: new Set(sharedResources.value.map(r => r.uploader_name)).size,
    downloads: sharedResources.value.reduce((s, r) => s + (r.download_count || 0), 0),
    tags: new Set(sharedResources.value.flatMap(r => parseTags(r.tags))).size
}));

function openDetail(resource) {
    router.push(`/resource/${resource.id}`);
}
</script>

<template>
    <div class="page">
        <div class="container">
            <!-- 统计概览 -->
            <div class="stats">
                <div class="stat-item">
                    <div class="stat-num">{{ stats.total }}</div>
                    <div class="stat-label">公开资源</div>
                </div>
                <div class="stat-item">
                    <div class="stat-num">{{ stats.uploaders }}</div>
                    <div class="stat-label">分享者</div>
                </div>
                <div class="stat-item">
                    <div class="stat-num">{{ stats.downloads }}</div>
                    <div class="stat-label">累计下载</div>
                </div>
                <div class="stat-item">
                    <div class="stat-num">{{ stats.tags }}</div>
                    <div class="stat-label">标签数</div>
                </div>
            </div>

            <!-- 类型筛选 -->
            <div class="tabs">
                <button
                    v-for="t in TABS"
                    :key="t.value"
                    class="tab"
                    :class="{ active: filterType === t.value }"
                    @click="filterType = t.value"
                >{{ t.label }}</button>
            </div>

            <!-- 资源列表 -->
            <div v-if="list.length" class="grid">
                <ResourceCard
                    v-for="r in list"
                    :key="r.id"
                    :resource="r"
                    @open="openDetail"
                />
            </div>
            <EmptyState v-else icon="📭" text="该分类下还没有资源，快去分享第一个吧" />
        </div>
    </div>
</template>
