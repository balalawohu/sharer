// Storage：统一存储门面
// 上层业务只依赖这里，无需关心底层是本地磁盘还是七牛云
import { STORAGE_DRIVER } from '../../config/storage.js';
import * as localStorage from './localStorage.js';
import * as qiniuStorage from './qiniuStorage.js';

const driver = STORAGE_DRIVER === 'qiniu' ? qiniuStorage : localStorage;

if (STORAGE_DRIVER === 'qiniu') {
    console.log('[存储] 当前使用：七牛云对象存储');
} else {
    console.log('[存储] 当前使用：本地磁盘');
}

export const currentDriver = STORAGE_DRIVER;

/**
 * 保存单个文件到存储服务
 * @param {Express.Multer.File} file
 * @param {{resourceType: string}} meta
 * @returns {Promise<{provider: string, file_name: string, file_path: string, origin_name: string}>}
 */
export function putFile(file, meta) {
    return driver.putFile(file, meta);
}

/**
 * 批量保存文件
 * @param {Express.Multer.File[]} files
 */
export function putFiles(files, meta) {
    return driver.putFiles(files, meta);
}

/**
 * 删除已存储的文件
 * @param {string} filePath 由 putFile 返回的 file_path
 */
export function removeFile(filePath) {
    return driver.removeFile(filePath);
}

/**
 * 签发前端直传凭证（仅七牛云模式支持）
 * @param {{resourceType?: string}} params
 */
export function buildUploadToken(params) {
    return driver.buildUploadToken(params);
}
