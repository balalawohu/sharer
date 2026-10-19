// API：用户模块
// 注意：url 不带 /api 前缀，baseURL（VITE_API_BASE_URL）已包含 http://localhost:3000/api
import request from '../request';

const authAPI = {
    // 登录：identifier 可传注册手机号或邮箱
    login(data) {
        return request({
            url: '/user/login',  // 注意axios会自动进行拼接的，会将baseURL和这个url进行拼接，所以说不用担心。
            method: 'post',
            data
        });
    },
    // 注册
    register(data) {
        return request({
            url: '/user/register',
            method: 'post',
            data
        });
    },
    // 退出登录
    logout() {
        return request({
            url: '/user/logout',
            method: 'post'
        });
    },
    // 获取当前登录用户信息（需登录态，拦截器自动带 token）
    getProfile() {
        return request({
            url: '/user/profile',
            method: 'get'
        });
    }
};

export default authAPI;
