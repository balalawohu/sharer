// Store：用户状态（登录凭证与基本信息）
import { defineStore } from 'pinia';
import { authAPI } from '../api';

const TOKEN_KEY = 'token';
const USER_KEY = 'sharer_user';

function readUser() {
    try {
        return JSON.parse(localStorage.getItem(USER_KEY)) || null;
    } catch {
        return null;
    }
}

export const useUserStore = defineStore('user', {
    state: () => ({
        token: localStorage.getItem(TOKEN_KEY) || '',
        // 登录后把后端返回的 user 对象存起来，供顶部导航等复用
        profile: readUser()
    }),

    getters: {
        isLogin: state => !!state.token,
        nickname: state => state.profile?.username || '',
        userId: state => state.profile?.id || null,
        // 头像：后端暂未提供头像字段时的降级显示（取昵称首字）
        avatarUrl: state => state.profile?.avatar || ''
    },

    actions: {
        /**
         * 登录：成功后保存 token 与用户信息
         */
        async login(payload) {
            const res = await authAPI.login(payload);
            if (res.code !== 200) return res;

            this.token = res.data.token;
            this.profile = res.data.user;
            localStorage.setItem(TOKEN_KEY, this.token);
            localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
            return res;
        },

        /**
         * 退出登录：清空本地凭证
         */
        logout() {
            this.token = '';
            this.profile = null;
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
        }
    }
});
