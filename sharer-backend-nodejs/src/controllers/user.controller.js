// Controller：用户控制器
// 职责：提取请求参数 → 调用校验/服务层 → 用统一格式响应，不写业务逻辑
import { validateRegister, validateLogin } from '../utils/validator.js';
import { registerUser, loginUser, ServiceError } from '../services/user.service.js';

// ---------- 注册 ----------
export async function register(req, res) {
    const { username, account, password, email } = req.body;

    try {
        // 1. 参数校验（含邮箱格式，选填字段填了才校验）
        const errMsg = validateRegister({ username, account, password, email });
        if (errMsg) return res.fail(errMsg, 400);

        // 2. 业务处理
        const user = await registerUser({ username, account, password, email });

        // 3. 返回脱敏后的用户信息
        return res.ok(user, '注册成功');
    } catch (error) {
        if (error instanceof ServiceError) {
            return res.fail(error.message, error.code);
        }
        console.error('[注册失败]', error);
        return res.fail('注册失败，请稍后重试', 500);
    }
}

// ---------- 登录 ----------
export async function login(req, res) {
    // identifier就是账号，但是前端上传的是邮箱还是account需要进行判断，所以使用identifier，并没有使用account或email来明确信息内容
    const { identifier, password } = req.body;

    try {
        // 1. 参数校验（identifier 可为登录账号或邮箱）
        const errMsg = validateLogin({ identifier, password });
        if (errMsg) return res.fail(errMsg, 400);

        // 2. 校验凭证并签发 token
        const { token, user } = await loginUser({ identifier, password });

        return res.ok({ token, user }, '登录成功');
    } catch (error) {
        if (error instanceof ServiceError) {
            return res.fail(error.message, error.code);
        }
        console.error('[登录失败]', error);
        return res.fail('登录失败，请稍后重试', 500);
    }
}

// ---------- 退出登录 ----------
// JWT 是无状态的，服务端不保存会话；真正的"退出"由前端清除本地 token 完成。
// 后端在此只需约定：前端调用后删除 token 即可。
export async function logout(req, res) {
    return res.ok(null, '退出成功');
}
