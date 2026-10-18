// 基础业务封装
import axios from 'axios';

// Vite 环境变量：以 VITE_ 开头的变量才会暴露给客户端代码   这一点需要注意，前端代码是运行在浏览器中的，不是NodeJS中，所以是无法使用dotenv进行环境变量的管理的。 但是这个也是可以配置的，但是还是不能使用dotenv进行环境变量的管理的。
const baseURL = import.meta.env.VITE_API_BASE_URL;

// 创建一个axios实例
const request = axios.create({
  baseURL,
  timeout: 10000 // 请求超时时间 10s
});

// 请求拦截器：统一携带 token
request.interceptors.request.use(config => {
  // 首先检查token是否存在，如果说不存在，则将token添加到请求头中，如果说存在，就不动
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器：统一拆包与错误提示   响应拦截器是针对于后端发给前端的数据进行一个处理
request.interceptors.response.use(
  response => response.data, // 直接返回 { code, msg, data }，调用方少写一层 .data
  error => {
    // 后端返回的业务错误（HTTP 200 + 业务 code）不会进到这里，
    // 只有网络错误 / 非 2xx 状态码才会进入
    const msg = error.response?.data?.msg || error.message || '网络异常，请稍后重试';
    console.error('[请求错误]', msg);
    return Promise.reject(new Error(msg));
  }
);

export default request;
