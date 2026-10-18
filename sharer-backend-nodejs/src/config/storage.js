// Config：存储驱动配置
// STORAGE_DRIVER = local（本地磁盘） | qiniu（七牛云对象存储）
// 切换只需改环境变量，业务层无需改动

export const STORAGE_DRIVER = (process.env.STORAGE_DRIVER || 'local').toLowerCase();

export const QINIU = {
    accessKey: process.env.QINIU_ACCESS_KEY,
    secretKey: process.env.QINIU_SECRET_KEY,
    bucket: process.env.QINIU_BUCKET,
    // 访问域名，结尾不要带 /
    domain: (process.env.QINIU_DOMAIN || '').replace(/\/$/, ''),
    // 上传凭证有效期（秒）
    tokenExpires: Number(process.env.QINIU_UPLOAD_TOKEN_EXPIRES || 3600)
};

/**
 * 校验七牛配置是否完整
 * @throws {Error} 配置缺失时抛错
 */
export function assertQiniuConfig() {
    const missing = Object.entries(QINIU)
        .filter(([key, value]) => key !== 'tokenExpires' && !value)
        .map(([key]) => key);

    if (missing.length) {
        throw new Error(`七牛云配置缺失：${missing.join(', ')}，请在 .env 中配置`);
    }
}

/**
 * 从完整 URL 中提取对象 key（用于删除/二次处理）
 * @param {string} url
 */
export function extractKey(url) {
    if (!QINIU.domain) return url;
    return url.startsWith(QINIU.domain) ? url.slice(QINIU.domain.length + 1) : url;
}
