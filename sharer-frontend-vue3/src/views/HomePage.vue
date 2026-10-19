<!-- View：资源广场（首页） -->
<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import VirtualList from '../components/VirtualList.vue';
import NormalList from '../components/NormalList.vue';
import ResourceRow from '../components/ResourceRow.vue';
import { PLAZA_RESOURCES, RESOURCE_TYPES, PLAZA_MOCK_SIZE } from '../mock/resources';

const router = useRouter();

// ============ 列表模式开关（代码层控制，不暴露到页面上） ============
// 'virtual' —— 虚拟滚动：只渲染可视区节点，1 万条也无压力（推荐）
// 'normal'  —— 普通列表：一次性渲染全部 DOM，用于对照体验卡顿感（数据量大时请勿切到该模式）
const LIST_MODE = 'normal';

const filterType = ref('all');
const TABS = [{ value: 'all', label: '全部' }, ...RESOURCE_TYPES];

// 广场只展示公开分享的资源
const sharedResources = computed(() => PLAZA_RESOURCES.filter(r => r.visibility === 1));

const list = computed(() =>
    filterType.value === 'all'
        ? sharedResources.value
        : sharedResources.value.filter(r => r.resource_type === filterType.value)
);

// 顶部统计
const stats = computed(() => ({
    total: PLAZA_RESOURCES.length,
    mockSize: PLAZA_MOCK_SIZE,
    shared: sharedResources.value.length,
    current: list.value.length
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
                    <div class="stat-num">{{ stats.mockSize }}</div>
                    <div class="stat-label">模拟数据总量</div>
                </div>
                <div class="stat-item">
                    <div class="stat-num">{{ stats.shared }}</div>
                    <div class="stat-label">公开资源</div>
                </div>
                <div class="stat-item">
                    <div class="stat-num">{{ stats.current }}</div>
                    <div class="stat-label">当前筛选结果</div>
                </div>
                <div class="stat-item">
                    <div class="stat-num">{{ LIST_MODE === 'virtual' ? '虚拟列表' : '普通列表' }}</div>
                    <div class="stat-label">当前渲染模式</div>
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

            <!-- ============ 列表渲染区（两个分支共用 ResourceRow） ============ -->
            <VirtualList
                v-if="LIST_MODE === 'virtual'"
                :items="list"
                :item-height="96"
                :container-height="640"
            >
                <template #default="{ item, index }">
                    <ResourceRow :item="item" :index="index" @click="openDetail(item)" />
                </template>
            </VirtualList>

            <NormalList v-else :items="list">
                <template #default="{ item, index }">
                    <ResourceRow :item="item" :index="index" @click="openDetail(item)" />
                </template>
            </NormalList>
        </div>
    </div>
</template>

<style scoped>
/* 行高必须固定为 96px（其中 10px 为行间距），与 VirtualList 的 itemHeight 保持一致 */
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
