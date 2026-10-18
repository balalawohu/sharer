<!-- View：搜索结果页 -->
<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ResourceCard from '../components/ResourceCard.vue';
import EmptyState from '../components/EmptyState.vue';
import { MOCK_RESOURCES } from '../mock/resources';
import { parseTags } from '../utils/format';

const route = useRoute();
const router = useRouter();

const keyword = computed(() => (route.query.q || '').toString().trim());

const list = computed(() => {
    const k = keyword.value.toLowerCase();
    if (!k) return [];
    return MOCK_RESOURCES.filter(r => {
        if (r.visibility !== 1) return false;
        const hay = (r.title + r.description + (r.uploader_name || '') + parseTags(r.tags).join(' ')).toLowerCase();
        return hay.includes(k);
    });
});

function openDetail(resource) {
    router.push(`/resource/${resource.id}`);
}
</script>

<template>
    <div class="page">
        <div class="container">
            <div class="search-head">
                <h2>
                    {{ keyword ? `搜索「${keyword}」的结果` : '请输入关键词进行搜索' }}
                    <span v-if="keyword" class="result-count">（{{ list.length }} 条）</span>
                </h2>
                <RouterLink to="/" class="btn btn-sm">返回广场</RouterLink>
            </div>

            <div v-if="list.length" class="grid">
                <ResourceCard v-for="r in list" :key="r.id" :resource="r" @open="openDetail" />
            </div>
            <EmptyState v-else icon="🔍" text="没有找到匹配的资源，换个关键词试试" />
        </div>
    </div>
</template>

<style scoped>
.search-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
}

.search-head h2 {
    font-size: 18px;
}

.result-count {
    font-size: 14px;
    font-weight: 400;
    color: var(--text-soft);
}
</style>
