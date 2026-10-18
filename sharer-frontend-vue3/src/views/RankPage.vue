<!-- View：排行榜 -->
<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import EmptyState from '../components/EmptyState.vue';
import { MOCK_RESOURCES } from '../mock/resources';
import { typeLabel } from '../mock/resources';

const router = useRouter();

const mode = ref('downloads');

const TABS = [
    { value: 'downloads', label: '下载榜' },
    { value: 'latest', label: '最新榜' },
    { value: 'users', label: '活跃用户榜' }
];

const shared = computed(() => MOCK_RESOURCES.filter(r => r.visibility === 1));

// 资源榜：按下载数 / 时间排序
const resourceRank = computed(() => {
    const list = [...shared.value];
    if (mode.value === 'downloads') {
        list.sort((a, b) => (b.download_count || 0) - (a.download_count || 0));
    } else {
        list.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    }
    return list.slice(0, 10);
});

// 用户榜：按名下资源被下载总量排序
const userRank = computed(() => {
    const map = {};
    shared.value.forEach(r => {
        const name = r.uploader_name || '匿名';
        map[name] = map[name] || { name, uploads: 0, downloads: 0 };
        map[name].uploads += 1;
        map[name].downloads += r.download_count || 0;
    });
    return Object.values(map)
        .sort((a, b) => b.downloads - a.downloads)
        .slice(0, 10);
});

function openDetail(r) {
    router.push(`/resource/${r.id}`);
}

function rankClass(i) {
    return i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : '';
}
</script>

<template>
    <div class="page">
        <div class="container">
            <div class="tabs">
                <button
                    v-for="t in TABS"
                    :key="t.value"
                    class="tab"
                    :class="{ active: mode === t.value }"
                    @click="mode = t.value"
                >{{ t.label }}</button>
            </div>

            <div class="panel">
                <!-- 活跃用户榜 -->
                <template v-if="mode === 'users'">
                    <div v-for="(u, i) in userRank" :key="u.name" class="rank-row">
                        <span class="rank-num" :class="rankClass(i)">{{ i + 1 }}</span>
                        <div class="rank-main">
                            <div class="rank-name">{{ u.name }}</div>
                            <div class="rank-sub">上传 {{ u.uploads }} 个资源</div>
                        </div>
                        <span class="rank-score">⬇ {{ u.downloads }}</span>
                    </div>
                    <EmptyState v-if="!userRank.length" icon="🏆" text="暂无排行数据" />
                </template>

                <!-- 资源榜 -->
                <template v-else>
                    <div v-for="(r, i) in resourceRank" :key="r.id" class="rank-row" @click="openDetail(r)">
                        <span class="rank-num" :class="rankClass(i)">{{ i + 1 }}</span>
                        <span class="badge badge-type">{{ typeLabel(r.resource_type) }}</span>
                        <div class="rank-main">
                            <div class="rank-name">{{ r.title }}</div>
                            <div class="rank-sub">{{ r.uploader_name }} · {{ r.created_at }}</div>
                        </div>
                        <span class="rank-score">
                            {{ mode === 'downloads' ? '⬇ ' + (r.download_count || 0) : r.created_at }}
                        </span>
                    </div>
                    <EmptyState v-if="!resourceRank.length" icon="🏆" text="暂无排行数据" />
                </template>
            </div>
        </div>
    </div>
</template>

<style scoped>
.rank-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid var(--border);
    cursor: pointer;
}

.rank-row:last-child {
    border-bottom: none;
}

.rank-row:hover .rank-name {
    color: var(--primary);
}

.rank-num {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-soft);
    background: #f2f4f8;
    border-radius: 8px;
}

.rank-num.top1 { color: #fff; background: #d4a017; }
.rank-num.top2 { color: #fff; background: #98a1ab; }
.rank-num.top3 { color: #fff; background: #b87333; }

.rank-main {
    flex: 1;
    min-width: 0;
}

.rank-name {
    font-size: 14px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.rank-sub {
    margin-top: 2px;
    font-size: 12px;
    color: var(--text-soft);
}

.rank-score {
    flex-shrink: 0;
    font-size: 13px;
    color: var(--text-soft);
}
</style>
