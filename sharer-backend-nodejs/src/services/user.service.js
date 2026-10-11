// Service：用户业务逻辑层
// 控制器只做参数提取与响应，业务规则（查重、加密、建用户）都在这里
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UniqueConstraintError, Op } from 'sequelize';
import User from '../models/user.model.js';

/**
 * 业务异常：携带 HTTP 状态码，控制器统一捕获处理
 */
export class ServiceError extends Error {
    constructor(message, code = 400) {
        super(message);
        this.code = code;
    }
}

/**
 * 脱敏：剔除密码字段，返回可安全返回给前端的用户对象
 * @param {import('sequelize').Model} user
 */
function stripPassword(user) {
    const { password: _, ...safeUser } = user.toJSON();
    return safeUser;
}

/**
 * 注册用户
 * @param {{username: string, account: string, password: string, email?: string}} params
 * @returns {Promise<object>} 脱敏后的用户信息（不含密码）
 * @throws {ServiceError} 字段冲突（409）/ 服务异常（500）
 */
export async function registerUser({ username, account, password, email }) {
    const cleanUsername = username.trim();
    const cleanAccount = account.trim();

    try {
        // 1. 唯一性预检查（提前给出友好提示；真正的兜底靠数据库 UNIQUE 约束）
        const conflicted = await User.findOne({
            where: [
                { account: cleanAccount },
                { username: cleanUsername },
                ...(email ? [{ email }] : [])
            ]
        });
        if (conflicted) {
            if (conflicted.account === cleanAccount) throw new ServiceError('该账号已被注册', 409);
            if (conflicted.username === cleanUsername) throw new ServiceError('该昵称已被使用', 409);
            throw new ServiceError('该邮箱已被绑定', 409);
        }

        // 2. 密码加密（bcrypt，成本因子10）
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. 创建用户（created_at / updated_at 由 Sequelize 自动填充）
        const user = await User.create({
            username: cleanUsername,
            account: cleanAccount,
            password: hashedPassword,
            email: email || null
        });

        return stripPassword(user);
    } catch (error) {
        // 并发场景兜底：两个请求同时通过预检查时，数据库 UNIQUE 约束会拒绝后者
        if (error instanceof UniqueConstraintError) {
            throw new ServiceError('该账号/昵称/邮箱已被注册', 409);
        }
        throw error;
    }
}

/**
 * 按登录账号查询用户（登录接口可直接复用）
 * @param {string} account
 * @returns {Promise<import('sequelize').Model|null>} 含密码的完整模型实例
 */
export async function findUserByAccount(account) {
    return User.findOne({ where: { account: account.trim() } });
}

/**
 * 按登录账号或邮箱查询用户（登录接口复用）
 * @param {string} identifier 账号或邮箱
 * @returns {Promise<import('sequelize').Model|null>} 含密码的完整模型实例
 */
export async function findUserByIdentifier(identifier) {
    const id = identifier.trim();
    return User.findOne({
        where: { [Op.or]: [{ account: id }, { email: id }] }
    });
}

/**
 * 用户登录：校验凭证并签发 JWT
 * @param {{identifier: string, password: string}} params
 * @returns {Promise<{token: string, user: object}>} token 与脱敏后的用户信息
 * @throws {ServiceError} 账号不存在/密码错误（401）/ 账号被禁用（403）
 */
export async function loginUser({ identifier, password }) {
    const user = await findUserByIdentifier(identifier);

    // 统一提示「账号或密码错误」，避免暴露"该账号是否已注册"
    if (!user) throw new ServiceError('账号或密码错误', 401);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new ServiceError('账号或密码错误', 401);

    if (user.status !== 1) throw new ServiceError('该账号已被禁用，请联系管理员', 403);

    // 签发 JWT，payload 只放最小必要信息
    const token = jwt.sign(
        { id: user.id, account: user.account },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    return { token, user: stripPassword(user) };
}
