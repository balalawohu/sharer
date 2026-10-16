// Utils：注册参数校验
// 校验通过返回 null，失败返回错误提示信息

/**
 * 校验手机号格式：中国大陆手机号，11位数字，1开头、第二位3-9
 * @param {string} phone
 * @returns {string|null} 错误提示信息，null 表示校验通过
 */
export function validatePhone(phone) {
    if (!/^1[3-9]\d{9}$/.test(phone)) return '手机号格式不正确';
    return null;
}

/**
 * 校验注册参数
 * @param {{username?: string, account?: string, password?: string, email?: string}} params
 * @returns {string|null} 错误提示信息，null 表示校验通过
 */
export function validateRegister({ username, account, password, email }) {
    if (!username || !username.trim()) return '用户昵称不能为空';
    if (username.trim().length > 50) return '用户昵称不能超过50个字符';
    if (!account || !account.trim()) return '登录账号不能为空';
    if (validatePhone(account.trim()) !== null) return '登录账号必须是手机号';
    if (!password) return '密码不能为空';
    if (password.length < 6 || password.length > 32) return '密码长度需为6-32个字符';
    if (validatePasswordStrength(password) !== null) return '密码强度不足：需同时包含字母和数字';
    if (email && validateEmail(email) !== null) return '邮箱格式不正确';
    return null;
}

/**
 * 校验邮箱格式
 * @param {string} email
 * @returns {string|null} 错误提示信息，null 表示校验通过
 */
export function validateEmail(email) {
    if (!/^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(email)) return '邮箱格式不正确';
    return null;
}

/**
 * 校验密码强度：需同时包含字母和数字，且只含安全字符（字母、数字、常用特殊字符）
 * @param {string} password
 * @returns {string|null} 错误提示信息，null 表示校验通过
 */
export function validatePasswordStrength(password) {
    if (typeof password !== 'string' || !/^[A-Za-z0-9!@#$%^&*()_+\-=[\]{};:'",.<>/?\\|`~]{6,32}$/.test(password)) {
        return '密码只能包含字母、数字和常用特殊字符';
    }
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
        return '密码需同时包含字母和数字';
    }
    // 弱密码黑名单：常见纯数字/键盘/生日类密码
    const weakPasswords = ['123456', '12345678', 'password', 'qwerty', 'abc123', '111111', '000000', 'a123456'];
    if (weakPasswords.includes(password.toLowerCase())) {
        return '密码过于简单，请更换';
    }
    return null;
}

/**
 * 校验登录参数：identifier 可以是登录账号或邮箱，二选一
 * @param {{identifier?: string, password?: string}} params
 * @returns {string|null} 错误提示信息，null 表示校验通过
 */
export function validateLogin({ identifier, password }) {
    if (!identifier || !identifier.trim()) return '请输入登录账号或邮箱';
    if (identifier.trim().length > 100) return '账号/邮箱长度不能超过100个字符';
    if (!password) return '密码不能为空';
    if (password.length < 6 || password.length > 32) return '密码长度需为6-32个字符';
    return null;
}
