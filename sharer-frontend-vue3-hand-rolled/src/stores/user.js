// 这个是用户的状态管理
import { ref, reactive } from 'vue'
import AuthAPI from '@/api/index'
import { defineStore } from 'pinia'

const TOKEN_KEY = 'sharer_token'    // 这个是token对应的键名
const USER_KEY = 'sharer_user'      // 这个是用户信息对应的键名


function readUser() {
    try {
        return JSON.parse(localStorage.getItem(USER_KEY)) || null;
    } catch {
        return null;
    }
}

export const useUserStore = defineStore('user', () => {
    const token = ref(localStorage.getItem(TOKEN_KEY) || '')  // 如果说有就获取对应的token，没有就为空

    const user = ref(readUser());

}) 