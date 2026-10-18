// Middleware：文件上传错误处理
// multer 的错误不走业务异常，需要单独识别并转成统一响应格式
import { MulterError } from 'multer';
import { MAX_FILE_SIZE, MAX_FILE_COUNT } from '../config/upload.js';

export default function uploadErrorHandler(err, req, res, next) {
    if (err instanceof MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.fail(`文件大小不能超过 ${MAX_FILE_SIZE / 1024 / 1024}MB`, 400);
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.fail(`单次最多上传 ${MAX_FILE_COUNT} 个文件`, 400);
        }
        return res.fail('文件上传失败：' + err.message, 400);
    }

    // fileFilter 里抛出的自定义错误（如不支持的文件类型）
    if (err && err.message && err.message.includes('不支持的文件类型')) {
        return res.fail(err.message, 400);
    }

    return next(err);
}
