<script setup>
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const form = reactive({
    identifier: '',  // 登录标识：注册手机号或邮箱
    password: '',    // 密码
})

// 提交状态与提示信息
const loading = ref(false);
const errorMsg = ref('');

// ---------- 密码显示/隐藏 ----------
const showPassword = ref(false);

// ---------- 提交登录 ----------
async function handleLogin() {
    // 防止重复提交
    if (loading.value) return;
    errorMsg.value = '';

    // 1. 前端校验：只拦截明显无效的提交，具体格式（如密码强度）由后端校验
    if (!form.identifier.trim()) return errorMsg.value = '请输入手机号或邮箱';
    if (!form.password) return errorMsg.value = '请输入密码';

    // 2. 通过 store 登录：成功后同步更新 token / 用户信息 / localStorage，
    //    这样导航栏、上传按钮等依赖 isLogin 的地方会立即响应
    loading.value = true;
    try {
        const res = await userStore.login({
            identifier: form.identifier.trim(),
            password: form.password
        });

        if (res.code !== 200) {
            // 业务错误：401 账号或密码错误、403 账号被禁用等，直接展示后端提示
            errorMsg.value = res.msg;
            return;
        }

        // 3. 登录成功，跳转到登录前想去的页面（守卫带上的 redirect），默认去广场
        const redirect = route.query.redirect?.toString();
        router.push(redirect || '/plaza');
    } catch (err) {
        // 网络错误等异常，拦截器已封装错误信息
        errorMsg.value = err.message || '登录失败，请稍后重试';
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <div class="login-page">
        <div class="login-card">
            <div class="header">
                <h1>欢迎回来</h1>
                <p>登录趣分，继续你的分享</p>
            </div>

            <form @submit.prevent="handleLogin" novalidate>
                <div class="form-item">
                    <label for="identifier">手机号 / 邮箱</label>
                    <input
                        type="text"
                        id="identifier"
                        v-model="form.identifier"
                        placeholder="请输入手机号或邮箱"
                        maxlength="100"
                    >
                </div>

                <div class="form-item">
                    <label for="password">密码</label>
                    <div class="input-wrap">
                        <input
                            :type="showPassword ? 'text' : 'password'"
                            id="password"
                            v-model="form.password"
                            placeholder="请输入密码"
                            maxlength="32"
                        >
                        <button
                            type="button"
                            class="toggle-btn"
                            @click="showPassword = !showPassword"
                            :title="showPassword ? '隐藏密码' : '显示密码'"
                        >{{ showPassword ? '隐藏' : '显示' }}</button>
                    </div>
                </div>

                <!-- 错误提示区域 -->
                <p v-if="errorMsg" class="msg error">{{ errorMsg }}</p>

                <button type="submit" class="submit-btn" :disabled="loading">
                    {{ loading ? '登录中...' : '登 录' }}
                </button>

                <p class="register-link">还没有账号？<RouterLink to="/register">去注册</RouterLink></p>
            </form>
        </div>
    </div>
</template>

<style scoped>
/* ---------- 简约风格：与注册页保持一致 ---------- */
.login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px 16px;
    background: #f7f8fa;
    box-sizing: border-box;
}

.login-card {
    width: 100%;
    max-width: 380px;
    background: #fff;
    border: 1px solid #ececec;
    border-radius: 10px;
    padding: 36px 32px;
    box-sizing: border-box;
}

/* ---------- 头部 ---------- */
.header {
    margin-bottom: 28px;
}

.header h1 {
    margin: 0 0 6px;
    font-size: 24px;
    font-weight: 600;
    color: #1f2329;
}

.header p {
    margin: 0;
    font-size: 14px;
    color: #8a919f;
}

/* ---------- 表单项 ---------- */
.form-item {
    margin-bottom: 16px;
}

label {
    display: block;
    margin-bottom: 6px;
    font-size: 13px;
    color: #4e5969;
}

.input-wrap {
    position: relative;
}

input {
    width: 100%;
    height: 40px;
    padding: 0 12px;
    font-size: 14px;
    color: #1f2329;
    background: #fff;
    border: 1px solid #e0e2e8;
    border-radius: 6px;
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.2s;
}

.input-wrap input {
    padding-right: 56px;
}

input::placeholder {
    color: #c2c7d0;
}

input:focus {
    border-color: #1f2329;
}

/* ---------- 显示/隐藏密码按钮 ---------- */
.toggle-btn {
    position: absolute;
    right: 6px;
    top: 50%;
    transform: translateY(-50%);
    height: 28px;
    padding: 0 8px;
    font-size: 12px;
    color: #8a919f;
    background: transparent;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: color 0.2s, background 0.2s;
}

.toggle-btn:hover {
    color: #1f2329;
    background: #f2f3f5;
}

/* ---------- 提示信息 ---------- */
.msg {
    margin: 0 0 12px;
    font-size: 13px;
    line-height: 1.5;
}
.msg.error {
    color: #f5222d;
}

/* ---------- 提交按钮 ---------- */
.submit-btn {
    width: 100%;
    height: 42px;
    border: none;
    border-radius: 6px;
    font-size: 15px;
    font-weight: 500;
    color: #fff;
    background: #1f2329;
    cursor: pointer;
    transition: opacity 0.2s;
}

.submit-btn:hover:not(:disabled) {
    opacity: 0.85;
}

.submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* ---------- 底部注册链接 ---------- */
.register-link {
    margin: 16px 0 0;
    text-align: center;
    font-size: 13px;
    color: #8a919f;
}

.register-link a {
    color: #1f2329;
    text-decoration: none;
    font-weight: 500;
}

.register-link a:hover {
    text-decoration: underline;
}

/* ---------- 小屏适配 ---------- */
@media (max-width: 480px) {
    .login-card {
        padding: 28px 20px;
        border: none;
        border-radius: 0;
    }
}
</style>
