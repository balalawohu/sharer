// Config：文件上传配置（multer）
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 上传根目录：<项目根>/uploads
export const UPLOAD_ROOT = path.join(__dirname, '..', '..', 'uploads');

// 允许的资源类型 → MIME 前缀映射
const ALLOWED_MIME_MAP = {
    image: ['image/'],
    audio: ['audio/'],
    video: ['video/']
};

// 单文件体积上限（单位：字节）
export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
// 单次请求最多可上传的文件数
export const MAX_FILE_COUNT = 9;

/**
 * 根据 MIME 类型推断资源分类
 * @param {string} mimetype
 * @returns {'image'|'audio'|'video'|'other'}
 */
export function resolveResourceType(mimetype) {
    for (const [type, prefixes] of Object.entries(ALLOWED_MIME_MAP)) {
        if (prefixes.some(prefix => mimetype.startsWith(prefix))) return type;
    }
    return 'other';
}

// 确保各类型子目录存在（首次启动时自动创建）
for (const type of [...Object.keys(ALLOWED_MIME_MAP), 'other']) {
    fs.mkdirSync(path.join(UPLOAD_ROOT, type), { recursive: true });
}

// ---------- 存储引擎 ----------
const storage = multer.diskStorage({
    destination(req, file, cb) {
        // 按资源类型分子目录：uploads/image/、uploads/audio/ ...
        const type = resolveResourceType(file.mimetype);
        cb(null, path.join(UPLOAD_ROOT, type));
    },
    filename(req, file, cb) {
        // 时间戳 + 随机串 + 原扩展名，避免同名文件覆盖
        const ext = path.extname(file.originalname).toLowerCase();
        const unique = crypto.randomBytes(12).toString('hex');
        cb(null, `${Date.now()}-${unique}${ext}`);
    }
});

// ---------- 文件过滤 ----------
const fileFilter = (req, file, cb) => {
    if (resolveResourceType(file.mimetype) === 'other') {
        return cb(new Error('不支持的文件类型，仅支持图片/音频/视频'));
    }
    cb(null, true);
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: MAX_FILE_COUNT
    }
});
