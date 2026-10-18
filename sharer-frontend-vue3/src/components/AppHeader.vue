<!-- Component：顶部导航栏 -->
<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useUserStore } from '../stores/user';

const emit = defineEmits(['upload']);

const router = useRouter();
const userStore = useUserStore();
const { isLogin, nickname, avatarUrl } = storeToRefs(userStore);

const keyword = ref('');

const NAVS = [
    { label: '资源广场', to: '/plaza' },
    { label: '我的资源', to: '/mine' },
    { label: '排行榜', to: '/rank' },
    { label: '帮助中心', to: '/help' }
];

function handleSearch() {
    const q = keyword.value.trim();
    if (q) router.push({ path: '/search', query: { q } });
}

function handleLogout() {
    userStore.logout();
    router.push('/login');
}
</script>

<template>
    <header class="topbar">
        <div class="topbar-inner">
            <!-- 品牌区 -->
            <RouterLink to="/" class="brand">
                <span class="brand-logo">趣</span>
                <span class="brand-text">趣分</span>
            </RouterLink>

            <!-- 导航 -->
            <nav class="nav">
                <RouterLink v-for="navItem in NAVS" :key="navItem.to" :to="navItem.to" class="nav-link">
                    {{ navItem.label }}
                </RouterLink>
            </nav>

            <!-- 搜索框 -->
            <form class="search-box" @submit.prevent="handleSearch">
                <input v-model="keyword" type="text" placeholder="搜索资源、标签…">
                <button type="submit" aria-label="搜索">🔍</button>
            </form>

            <!-- 右侧操作区 -->
            <div class="actions">
                <RouterLink v-if="isLogin" to="/notifications" class="icon-btn" title="通知">🔔</RouterLink>
                <button class="btn btn-primary btn-sm" @click="emit('upload')">＋ 上传资源</button>

                <template v-if="isLogin">
                    <div class="user-area">
                        <span v-if="!avatarUrl" class="avatar-text">{{ nickname.slice(0, 1) }}</span>
                        <img v-else :src="avatarUrl" alt="头像" class="avatar-img">
                        <span class="user-name">{{ nickname }}</span>
                        <button class="link-btn" @click="handleLogout">退出</button>
                    </div>
                </template>
                <template v-else>
                    <RouterLink to="/login" class="btn btn-sm">登录</RouterLink>
                </template>
            </div>
        </div>
    </header>
</template>

<style scoped>
.topbar {
    position: sticky;
    top: 0;
    z-index: 100;
    background: #fff;
    border-bottom: 1px solid var(--border);
    box-shadow: 0 2px 8px rgba(31, 41, 51, 0.04);
}

.topbar-inner {
    max-width: var(--max-width);
    margin: 0 auto;
    padding: 0 20px;
    height: 60px;
    display: flex;
    align-items: center;
    gap: 20px;
}

.brand {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
}

.brand-logo {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    background: var(--primary);
    border-radius: 8px;
    font-weight: 700;
}

.brand-text {
    font-size: 18px;
    font-weight: 700;
}

.nav {
    display: flex;
    gap: 4px;
}

.nav-link {
    padding: 6px 12px;
    font-size: 14px;
    color: var(--text-soft);
    border-radius: 8px;
    transition: all 0.15s;
}

.nav-link:hover {
    color: var(--primary);
    background: #f5f7fb;
}

.nav-link.router-link-exact-active {
    color: var(--primary);
    background: rgba(79, 110, 247, 0.1);
    font-weight: 500;
}

.search-box {
    flex: 1;
    max-width: 320px;
    display: flex;
    height: 34px;
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
}

.search-box input {
    flex: 1;
    padding: 0 12px;
    font-size: 14px;
    border: none;
    outline: none;
    background: transparent;
}

.search-box button {
    width: 40px;
    border: none;
    background: #f5f7fb;
    cursor: pointer;
}

.actions {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-left: auto;
}

.icon-btn {
    font-size: 16px;
}

.user-area {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
}

.avatar-text {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    background: var(--primary);
    border-radius: 50%;
    font-size: 13px;
}

.avatar-img {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: cover;
}

.user-name {
    color: var(--text);
}

.link-btn {
    border: none;
    background: none;
    color: var(--text-soft);
    font-size: 13px;
    cursor: pointer;
}

.link-btn:hover {
    color: var(--red);
}

@media (max-width: 900px) {
    .nav {
        display: none;
    }
    .search-box {
        max-width: 180px;
    }
}

@media (max-width: 640px) {
    .brand-text,
    .user-name {
        display: none;
    }
}
</style>
