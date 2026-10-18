// Middleware：JWT 鉴权
// 校验 Authorization: Bearer <token>，通过后把用户信息挂到 req.user
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export async function authMiddleware(req, res, next) {
    try {
        const header = req.headers.authorization || '';
        const token = header.startsWith('Bearer ') ? header.slice(7) : null;

        if (!token) return res.fail('未提供登录凭证', 401);

        let payload;
        try {
            payload = jwt.verify(token, process.env.JWT_SECRET);
        } catch (e) {
            return res.fail('登录凭证无效或已过期', 401);
        }

        const user = await User.findByPk(payload.id);
        if (!user) return res.fail('用户不存在', 401);
        if (user.status !== 1) return res.fail('该账号已被禁用，请联系管理员', 403);

        // 挂载到 req.user，后续业务层可直接取用（不含 password）
        const { password: _, ...safeUser } = user.toJSON();
        req.user = safeUser;

        next();
    } catch (error) {
        console.error('[鉴权异常]', error);
        return res.fail('鉴权失败', 500);
    }
}

export default authMiddleware;
