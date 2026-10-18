<!-- Layout：主布局（顶部导航 + 内容区 + 上传弹窗） -->
<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import AppHeader from '../components/AppHeader.vue';
import UploadModal from '../components/UploadModal.vue';
import { useUserStore } from '../stores/user';

const router = useRouter();
const userStore = useUserStore();
const { isLogin } = storeToRefs(userStore);

const showUpload = ref(false);

function openUpload() {
    // 未登录时先引导登录
    if (!isLogin.value) {
        router.push('/login');
        return;
    }
    showUpload.value = true;
}

function handleUploadSuccess() {
    showUpload.value = false;
    // 通知「我的资源」页刷新列表（广播事件解耦组件关系）
    document.dispatchEvent(new CustomEvent('resource-uploaded'));
    router.push('/mine');
}
</script>

<template>
    <div class="layout">
        <AppHeader @upload="openUpload" />

        <main class="main">
            <RouterView />
        </main>

        <footer class="footer">
            <div class="footer-inner">
                <span>趣分 · 资源共享平台</span>
                <RouterLink to="/help" class="footer-link">帮助中心</RouterLink>
            </div>
        </footer>

        <UploadModal v-if="showUpload" @close="showUpload = false" @success="handleUploadSuccess" />
    </div>
</template>

<style scoped>
.layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.main {
    flex: 1;
}

.footer {
    border-top: 1px solid var(--border);
    background: #fff;
}

.footer-inner {
    max-width: var(--max-width);
    margin: 0 auto;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: var(--text-soft);
}

.footer-link:hover {
    color: var(--primary);
}
</style>
