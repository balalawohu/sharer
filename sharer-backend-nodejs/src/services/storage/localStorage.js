// Storage：本地磁盘存储实现
// multer 已把文件写到 uploads/<类型>/ 下，这里只需产出可访问路径
import fs from 'fs/promises';
import path from 'path';
import { UPLOAD_ROOT } from '../../config/upload.js';

// 静态资源挂载前缀，与 index.js 中 app.use('/uploads', ...) 对应
const STATIC_PREFIX = '/uploads';

export async function putFile(file, { resourceType }) {
    const relative = `${resourceType}/${file.filename}`;
    return {
        provider: 'local',
        file_name: file.filename,
        file_path: `${STATIC_PREFIX}/${relative}`, // 可直接拼到服务域名后访问
        origin_name: file.originalname
    };
}

export async function putFiles(files, meta) {
    return Promise.all(files.map(file => putFile(file, meta)));
}

/**
 * 删除本地文件
 * @param {string} filePath 形如 /uploads/image/xxx.png
 */
export async function removeFile(filePath) {
    if (!filePath) return;
    const absolute = path.join(UPLOAD_ROOT, filePath.replace(STATIC_PREFIX, ''));
    await fs.unlink(absolute).catch(() => {});
}

export function buildUploadToken() {
    throw new Error('本地存储模式不支持前端直传凭证，请将 STORAGE_DRIVER 切换为 qiniu');
}
