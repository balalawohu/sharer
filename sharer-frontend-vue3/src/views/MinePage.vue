<!-- View：我的资源 -->
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import ResourceCard from '../components/ResourceCard.vue';
import EmptyState from '../components/EmptyState.vue';
import { uploadAPI } from '../api';
import { useUserStore } from '../stores/user';

const userStore = useUserStore();
const { isLogin, nickname } = storeToRefs(userStore);

const list = ref([]);
const total = ref(0);
const filterType = ref('all');
const loading = ref(false);
const errorMsg = ref('');

const TABS = [
    { value: 'all', label: '全部' },
    { value: 'image', label: '图片' },
    { value: 'audio', label: '音频' },
    { value: 'video', label: '视频' }
];

// 榜单统计
const stats = computed(() => ({
    total: list.value.length,
    shared: list.value.filter(r => r.visibility === 1).length,
    downloads: list.value.reduce((s, r) => s + (r.download_count || 0), 0)
}));

async function fetchList() {
    loading.value = true;
    errorMsg.value = '';
    try {
        const res = await uploadAPI.myResources({
            resourceType: filterType.value === 'all' ? undefined : filterType.value,
            pageSize: 100
        });

        if (res.code !== 200) {
            errorMsg.value = res.msg;
            list.value = [];
            return;
        }

        const data = res.data || {};
        list.value = data.list || [];
        total.value = data.total || 0;
    } catch (err) {
        errorMsg.value = err.message || '加载失败，请稍后重试';
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    fetchList();
    // 上传成功后由布局广播事件，触发列表刷新
    document.addEventListener('resource-uploaded', fetchList);
});

onUnmounted(() => {
    document.removeEventListener('resource-uploaded', fetchList);
});

// 切换筛选时重新请求
function changeType(value) {
    filterType.value = value;
    fetchList();
}

async function handleDelete(resource) {
    if (!confirm(`确定删除资源「${resource.title}」吗？`)) return;

    try {
        const res = await uploadAPI.remove(resource.id);
        if (res.code !== 200) return alert(res.msg);
        await fetchList(); // 删除后刷新列表
    } catch (err) {
        alert(err.message || '删除失败');
    }
}

function handleToggleShare() {
    // TODO: 后端暂未提供「修改资源信息」接口，实现后在此调用
    alert('可见性切换功能开发中');
}

defineExpose({ fetchList });
</script>

<template>
    <div class="page">
        <div class="container">
            <!-- 未登录提示 -->
            <EmptyState v-if="!isLogin" icon="🔒" text="请先登录后再查看我的资源">
                <RouterLink to="/login" class="btn btn-primary btn-sm">去登录</RouterLink>
            </EmptyState>

            <template v-else>
                <div class="stats">
                    <div class="stat-item">
                        <div class="stat-num">{{ stats.total }}</div>
                        <div class="stat-label">我的资源</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-num">{{ stats.shared }}</div>
                        <div class="stat-label">已公开</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-num">{{ stats.downloads }}</div>
                        <div class="stat-label">被下载次数</div>
                    </div>
                </div>

                <div class="tabs">
                    <button
                        v-for="t in TABS"
                        :key="t.value"
                        class="tab"
                        :class="{ active: filterType === t.value }"
                        @click="changeType(t.value)"
                    >{{ t.label }}</button>
                    <button class="btn btn-sm refresh" @click="fetchList">刷新</button>
                </div>

                <p v-if="errorMsg" class="msg error">{{ errorMsg }}</p>

                <div v-if="loading" class="empty">加载中…</div>

                <div v-else-if="list.length" class="grid">
                    <ResourceCard
                        v-for="r in list"
                        :key="r.id"
                        :resource="{ ...r, uploader_name: nickname }"
                        owned
                        @delete="handleDelete"
                        @toggle-share="handleToggleShare"
                    />
                </div>

                <EmptyState
                    v-else-if="!errorMsg"
                    icon="📁"
                    text="还没有上传资源，点击右上角「上传资源」开始分享"
                />
            </template>
        </div>
    </div>
</template>

<style scoped>
.msg.error {
    margin-bottom: 12px;
    font-size: 13px;
    color: var(--red);
}

.refresh {
    margin-left: auto;
}
</style>
