<!-- View：我的资源（含个人名片） -->
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import ResourceCard from '../components/ResourceCard.vue';
import EmptyState from '../components/EmptyState.vue';
import { uploadAPI } from '../api';
import { useUserStore } from '../stores/user';
import { formatDate } from '../utils/format';

const router = useRouter();
const userStore = useUserStore();
const { isLogin, nickname, avatarUrl, profile } = storeToRefs(userStore);

const list = ref([]);
const total = ref(0);
const filterType = ref('all');
const loading = ref(false);
const errorMsg = ref('');
// 名片资料加载中标识
const profileLoading = ref(false);

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

// ---------- 名片展示字段 ----------
// 账号脱敏：手机号中间四位打码
const maskedAccount = computed(() => {
    const account = profile.value?.account || '';
    if (/^1\d{10}$/.test(account)) {
        return account.slice(0, 3) + '****' + account.slice(7);
    }
    return account;
});

const emailText = computed(() => profile.value?.email || '未绑定');
const statusText = computed(() => (profile.value?.status === 1 ? '正常' : '已禁用'));

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

// 拉取最新用户资料，保证名片信息与后端一致
async function fetchProfile() {
    profileLoading.value = true;
    try {
        await userStore.fetchProfile();
    } catch (err) {
        errorMsg.value = err.message || '资料加载失败';
    } finally {
        profileLoading.value = false;
    }
}

onMounted(() => {
    fetchList();
    fetchProfile();
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

function handleLogout() {
    userStore.logout();
    router.push('/login');
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
                <!-- ========== 个人名片 ========== -->
                <div class="profile-card panel">
                    <div class="card-banner"></div>
                    <div class="card-body">
                        <div class="avatar-area">
                            <span v-if="!avatarUrl" class="avatar">{{ nickname.slice(0, 1) || 'U' }}</span>
                            <img v-else :src="avatarUrl" alt="头像" class="avatar">
                        </div>
                        <div class="info-area">
                            <h2 class="nickname">{{ nickname || '未设置昵称' }}</h2>
                            <p class="subtitle">趣分用户{{ profileLoading ? ' · 资料同步中…' : '' }}</p>

                            <div class="info-grid">
                                <div class="info-item">
                                    <span class="label">账号</span>
                                    <span class="value">{{ maskedAccount }}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">邮箱</span>
                                    <span class="value">{{ emailText }}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">注册时间</span>
                                    <span class="value">{{ formatDate(profile?.created_at) }}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">账号状态</span>
                                    <span class="value" :class="statusText === '正常' ? 'ok' : 'bad'">{{ statusText }}</span>
                                </div>
                            </div>

                            <div class="actions">
                                <button class="btn btn-sm" @click="fetchProfile">刷新资料</button>
                                <button class="btn btn-sm btn-danger" @click="handleLogout">退出登录</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ========== 资源统计 ========== -->
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
                    <div class="stat-item">
                        <div class="stat-num">{{ profile?.id || '—' }}</div>
                        <div class="stat-label">用户 ID</div>
                    </div>
                </div>

                <!-- ========== 资源筛选与列表 ========== -->
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
/* ---------- 个人名片 ---------- */
.profile-card {
    overflow: hidden;
    padding: 0;
    margin-bottom: 20px;
}

.card-banner {
    height: 88px;
    background: linear-gradient(135deg, #4f6ef7, #7a5cf7);
}

.card-body {
    display: flex;
    gap: 24px;
    padding: 0 24px 24px;
    margin-top: -40px;
}

.avatar-area {
    flex-shrink: 0;
}

.avatar {
    width: 84px;
    height: 84px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30px;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(135deg, #4f6ef7, #7a5cf7);
    border: 3px solid #fff;
    border-radius: 50%;
    box-shadow: var(--shadow);
    object-fit: cover;
}

.info-area {
    flex: 1;
    padding-top: 44px;
    min-width: 0;
}

.nickname {
    font-size: 20px;
    font-weight: 600;
}

.subtitle {
    margin: 2px 0 14px;
    font-size: 13px;
    color: var(--text-soft);
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    gap: 8px 20px;
    margin-bottom: 14px;
}

.info-item {
    display: flex;
    gap: 8px;
    font-size: 14px;
}

.info-item .label {
    color: var(--text-soft);
    flex-shrink: 0;
}

.info-item .value {
    color: var(--text);
    overflow: hidden;
    text-overflow: ellipsis;
}

.info-item .value.ok {
    color: var(--green);
}

.info-item .value.bad {
    color: var(--red);
}

.actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

/* ---------- 其他 ---------- */
.msg.error {
    margin-bottom: 12px;
    font-size: 13px;
    color: var(--red);
}

.refresh {
    margin-left: auto;
}

@media (max-width: 640px) {
    .card-body {
        flex-direction: column;
        gap: 12px;
    }

    .info-area {
        padding-top: 8px;
    }
}
</style>
