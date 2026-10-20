import axios from 'axios'

const request = axios.create({
    baseURL: 'http://localhost:3000',
})

// 给这个requets实例添加请求拦截器和响应拦截器

request.interceptors.request.use(
    config => {
        // 自动携带token
        // 1. 检测是否有Token
        const TOKEN_KEY = 'user_token'
        const token = localStorage.getItem(TOKEN_KEY)
        if(token){
            // token存在就添加到请求头中
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    }
)

request.interceptors.response.use(
    response => {
        // 这个地方只接受HTTP状态码返回正常的情况，比方说200
        const res = response.data
        // 可以校验业务是否正常
        if(res.code === 0) {
            // 假设前后端约定返回0表示业务正常
            return res;
        } else {
            // 这个就是其余所有的返回业务异常的情况

        }
    },
    error => {
        // 这个地方只接收HTTP状态码返回异常的情况

    }
)

export default request