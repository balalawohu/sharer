// Store：用户状态（登录凭证与基本信息）
import { ref, computed } from 'vue';
import { defineStore } from 'pinia';  // 引入pinia状态管理
import { authAPI } from '../api/index.js';

const TOKEN_KEY = 'token';
const USER_KEY = 'sharer_user';

function readUser() {
    try {
        return JSON.parse(localStorage.getItem(USER_KEY)) || null;
    } catch {
        return null;
    }
}

export const useUserStore = defineStore('user', () => {
    const token = ref(localStorage.getItem(TOKEN_KEY) || '');
    // 登录后把后端返回的 user 对象存起来，供顶部导航等复用
    const profile = ref(readUser());

    const isLogin = computed(() => !!token.value);
    const nickname = computed(() => profile.value?.username || '');
    const userId = computed(() => profile.value?.id || null);
    // 头像：后端暂未提供头像字段时的降级显示（取昵称首字）
    const avatarUrl = computed(() => profile.value?.avatar || '');

    /**
     * 登录：成功后保存 token 与用户信息
     */
    async function login(payload) {
        const res = await authAPI.login(payload);
        if (res.code !== 200) return res;

        token.value = res.data.token;
        profile.value = res.data.user;
        localStorage.setItem(TOKEN_KEY, token.value);
        localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
        return res;
    }

    /**
     * 退出登录：清空本地凭证
     */
    function logout() {
        token.value = '';
        profile.value = null;
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    }

    return { token, profile, isLogin, nickname, userId, avatarUrl, login, logout };
});
