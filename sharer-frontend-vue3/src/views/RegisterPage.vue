<script setup>
import { reactive, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { authAPI } from '../api/index.js';
import { validatePhone, validatePasswordStrength, validatePasswordSame } from '../utils/validator';

const router = useRouter();

const form = reactive({
    username: '',  // 用户名
    account: '',   // 手机号
    password: '',  // 密码
})

const confirmPassword = ref('');

const agree = ref(false);

// 提交状态与提示信息
const loading = ref(false);
const errorMsg = ref('');
const successMsg = ref('');

// ---------- 密码显示/隐藏 ----------
const showPassword = ref(false);
const showConfirmPassword = ref(false);

// ---------- 密码强度实时展示 ----------
const strength = computed(() => validatePasswordStrength(form.password));
// 密码为空时不显示强度条
const showStrength = computed(() => form.password.length > 0);

// ---------- 两次密码一致性：失焦（blur）即校验 ----------
// touched 标记用户是否已在对应输入框中停止输入过，避免刚进页面就报错
const passwordTouched = ref(false);
const confirmTouched = ref(false);

const sameHint = computed(() => {
    // 只要有一个框还没被"碰过"，就不提示
    if (!passwordTouched.value && !confirmTouched.value) return '';
    // 两个框都还没填完，也不提示
    if (!form.password || !confirmPassword.value) return '';
    return form.password === confirmPassword.value ? '' : '两次输入的密码不一致';
});

// 默认是不同意，点击之后变为同意
const isAgree = () => {
    agree.value = !agree.value;
}

// ---------- 提交注册 ----------
async function handleRegister() {
    // 防止重复提交
    if (loading.value) return;
    errorMsg.value = '';
    successMsg.value = '';

    // 1. 前端校验：本地拦截，减少无效请求，规则与后端保持一致
    if (!form.username.trim()) return errorMsg.value = '请输入用户名';

    const phoneErr = validatePhone(form.account.trim());
    if (phoneErr) return errorMsg.value = phoneErr;

    // 发送请求的前提是，两次输入的密码保持一致
    const sameErr = validatePasswordSame(form.password, confirmPassword.value);
    if (sameErr) return errorMsg.value = sameErr;

    // 密码强度校验：level 0 表示不符合基础要求
    if (!strength.value.valid) return errorMsg.value = strength.value.msg;

    if (!agree.value) return errorMsg.value = '请先阅读并同意《趣分用户协议》';

    // 2. 调用注册接口，后端返回 { code, msg, data }
    loading.value = true;
    try {
        const res = await authAPI.register({
            username: form.username.trim(),
            account: form.account.trim(),
            password: form.password
        });

        if (res.code !== 200) {
            // 业务错误（409 账号/昵称冲突、400 参数问题等），直接展示后端提示
            errorMsg.value = res.msg;
            return;
        }

        // 3. 注册成功，跳转到登录界面
        successMsg.value = '注册成功，请前往登录';
        router.push('/login');
    } catch (err) {
        // 网络错误等异常，拦截器已封装错误信息
        errorMsg.value = err.message || '注册失败，请稍后重试';
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <div class="register-page">
        <div class="register-card">
            <div class="header">
                <h1>创建账号</h1>
                <p>加入趣分，开始分享你的资源</p>
            </div>

            <form @submit.prevent="handleRegister" novalidate>
                <div class="form-item">
                    <label for="username">用户名</label>
                    <input type="text" id="username" v-model="form.username" placeholder="请输入用户名" maxlength="50">
                </div>

                <div class="form-item">
                    <label for="account">手机号</label>
                    <input type="text" id="account" v-model="form.account" placeholder="请输入手机号" maxlength="11">
                </div>

                <div class="form-item">
                    <label for="password">密码</label>
                    <div class="input-wrap">
                        <input
                            :type="showPassword ? 'text' : 'password'"
                            id="password"
                            v-model="form.password"
                            placeholder="6-32位，需包含字母和数字"
                            maxlength="32"
                            @blur="passwordTouched = true"
                        >
                        <button
                            type="button"
                            class="toggle-btn"
                            @click="showPassword = !showPassword"
                            :title="showPassword ? '隐藏密码' : '显示密码'"
                        >{{ showPassword ? '隐藏' : '显示' }}</button>
                    </div>
                    <!-- 密码强度条：输入密码后实时显示 -->
                    <div v-if="showStrength" class="strength">
                        <div class="strength-track">
                            <div
                                class="strength-bar"
                                :style="{ width: strength.level * 33.3 + '%', background: strength.color }"
                            ></div>
                        </div>
                        <span class="strength-text" :style="{ color: strength.color }">{{ strength.msg }}</span>
                    </div>
                </div>

                <div class="form-item">
                    <label for="confirm-password">确认密码</label>
                    <div class="input-wrap">
                        <input
                            :type="showConfirmPassword ? 'text' : 'password'"
                            id="confirm-password"
                            v-model="confirmPassword"
                            placeholder="请再次输入密码"
                            maxlength="32"
                            @blur="confirmTouched = true"
                        >
                        <!-- 失焦后实时提示两次密码是否一致 -->
                        <p v-if="sameHint" class="field-hint">{{ sameHint }}</p>
                        <button
                            type="button"
                            class="toggle-btn"
                            @click="showConfirmPassword = !showConfirmPassword"
                            :title="showConfirmPassword ? '隐藏密码' : '显示密码'"
                        >{{ showConfirmPassword ? '隐藏' : '显示' }}</button>
                    </div>
                </div>

                <!-- 错误/成功提示区域 -->
                <p v-if="errorMsg" class="msg error">{{ errorMsg }}</p>
                <p v-if="successMsg" class="msg success">{{ successMsg }}</p>

                <div class="agree-row" @click="isAgree">
                    <span class="checkbox" :class="{ checked: agree }"></span>
                    <span>我已阅读并同意<a href="javascript:;">《趣分用户协议》</a></span>
                </div>

                <button type="submit" class="submit-btn" :disabled="loading">
                    {{ loading ? '注册中...' : '立即注册' }}
                </button>

                <p class="login-link">已有账号？<RouterLink to="/login">去登录</RouterLink></p>
            </form>
        </div>
    </div>
</template>

<style scoped>
/* ---------- 简约风格：浅灰背景 + 白卡片 + 细边框 ---------- */
.register-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px 16px;
    background: #f7f8fa;
    box-sizing: border-box;
}

.register-card {
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

/* 有切换按钮的输入框，右侧留出按钮位置 */
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

/* ---------- 密码强度条 ---------- */
.strength {
    margin-top: 8px;
}

.strength-track {
    height: 4px;
    background: #eceef1;
    border-radius: 2px;
    overflow: hidden;
}

.strength-bar {
    height: 100%;
    border-radius: 2px;
    transition: width 0.3s, background 0.3s;
}

.strength-text {
    display: block;
    margin-top: 4px;
    font-size: 12px;
}

/* ---------- 输入框下方的实时校验提示 ---------- */
.field-hint {
    margin: 6px 0 0;
    font-size: 12px;
    color: #f5222d;
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
.msg.success {
    color: #52c41a;
}

/* ---------- 协议行：自绘复选框 ---------- */
.agree-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
    font-size: 13px;
    color: #8a919f;
    cursor: pointer;
    user-select: none;
}

.checkbox {
    width: 14px;
    height: 14px;
    border: 1px solid #c2c7d0;
    border-radius: 3px;
    flex-shrink: 0;
    position: relative;
    transition: background 0.15s, border-color 0.15s;
}

.checkbox.checked {
    background: #1f2329;
    border-color: #1f2329;
}

.checkbox.checked::after {
    content: '';
    position: absolute;
    left: 4px;
    top: 1px;
    width: 4px;
    height: 8px;
    border: solid #fff;
    border-width: 0 1.5px 1.5px 0;
    transform: rotate(45deg);
}

.agree-row a {
    color: #4e5969;
    text-decoration: none;
}

.agree-row a:hover {
    text-decoration: underline;
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

/* ---------- 底部登录链接 ---------- */
.login-link {
    margin: 16px 0 0;
    text-align: center;
    font-size: 13px;
    color: #8a919f;
}

.login-link a {
    color: #1f2329;
    text-decoration: none;
    font-weight: 500;
}

.login-link a:hover {
    text-decoration: underline;
}

/* ---------- 小屏适配 ---------- */
@media (max-width: 480px) {
    .register-card {
        padding: 28px 20px;
        border: none;
        border-radius: 0;
    }
}
</style>
