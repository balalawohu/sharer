import request from '../request'

const AuthAPI = {
    login(data) {
        return request({
            url: '/user/login',
            method: 'post',
            data,
        })
    },
    register(data) {
        return request({
            url: '/user/register',
            method: 'post',
            data,
        })
    },
    logout() {
        return request({
            url: '/user/logout',
            method: 'post'
        })
    }
}

export default AuthAPI