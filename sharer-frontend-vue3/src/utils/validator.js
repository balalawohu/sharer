// 进行信息校验

// 密码强度档位描述：level 与 passwordStrengthCompute 的返回值一一对应
const PASSWORD_LEVELS = [
    { level: 0, msg: '当前密码强度不符合要求，不符合使用条件', color: '#ccc', valid: false },
    { level: 1, msg: '密码强度较弱，请使用更加复杂的密码', color: '#f5222d', valid: true },
    { level: 2, msg: '密码强度中等，请继续使用', color: '#faad14', valid: true },
    { level: 3, msg: '密码强度强，请继续使用', color: '#52c41a', valid: true }
];

/**
 * 密码强度校验
 * @param {string} password
 * @returns {{level: number, msg: string, color: string, valid: boolean}}
 *          valid 为 false 表示密码不符合基础要求（对应 level 0），不应放行提交
 */
export function validatePasswordStrength(password) {
    const level = passwordStrengthCompute(password);
    return PASSWORD_LEVELS[level];
}

// 做一个密码强度计算工具
// 规则与后端 src/utils/validator.js 的 validatePasswordStrength 保持一致
// 返回值：0-不符合要求（长度/字符类型/黑名单不通过） 1-弱 2-中 3-强
function passwordStrengthCompute(password) {
    if (typeof password !== 'string') return 0;

    // 基础规则：长度 6-32，只允许字母、数字和常用特殊字符
    const allowedChars = /^[A-Za-z0-9!@#$%^&*()_+\-=[\]{};:'",.<>/?\\|`~]{6,32}$/;
    if (!allowedChars.test(password)) return 0;

    // 必须同时包含字母和数字
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return 0;

    // 弱密码黑名单（与后端一致）
    const weakPasswords = ['123456', '12345678', 'password', 'qwerty', 'abc123', '111111', '000000', 'a123456'];
    if (weakPasswords.includes(password.toLowerCase())) return 0;

    // 强度分级：按字符类别数 + 长度综合判断
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};:'",.<>/?\\|`~]/.test(password);
    const variety = [hasLower, hasUpper, hasDigit, hasSpecial].filter(Boolean).length;

    // 强：包含至少 3 类字符且长度 ≥ 10（4 类字符必然也满足此条件）
    if (variety >= 3 && password.length >= 10) return 3;

    // 中：包含 3 类字符，或 2 类字符但长度 ≥ 10
    // 注：能走到这里 variety ≥ 2（基础校验强制字母+数字），此处显式限定 variety，防止基础校验放宽后误放行
    if (variety >= 3 || (variety === 2 && password.length >= 10)) return 2;

    // 弱：仅字母 + 数字两类字符
    return 1;
}


// 两次密码进行校验的返回信息只在各自的输入框下面进行显示，是独立的
export function validatePasswordSame(password, confirmPassword) {
    if (password !== confirmPassword) {
        return '两次密码不一致'
    }
    return null;
}



// 需要写一些校验函数，比方说登录页面的账号是否是手机号，密码不需要进行校验，这个留给后端进行校验

/**
 * 手机号校验：中国大陆手机号，11 位数字，1 开头、第二位 3-9（与后端 validatePhone 规则一致）
 * @param {string} phone
 * @returns {string|null} 错误提示信息，null 表示校验通过
 */
export function validatePhone(phone) {
    if (!/^1[3-9]\d{9}$/.test(phone)) return '手机号格式不正确';
    return null;
}

// 注册界面也需要做一些校验函数，比方说账号是否是手机号，但是这个可以和上面这个进行通用，不需要再写一个。
