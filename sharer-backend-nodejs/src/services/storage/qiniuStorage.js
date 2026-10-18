// Storage：七牛云对象存储实现
// 两种使用场景：
//   1. 服务端中转：putFile 读取本地临时文件后流式上传到七牛
//   2. 前端直传：buildUploadToken 签发凭证，前端直传后由业务接口落库（不经过本文件）
import fs from 'fs';
import path from 'path';
import qiniu from 'qiniu';
import { QINIU, assertQiniuConfig, extractKey } from '../../config/storage.js';

function getClients() {
    assertQiniuConfig();
    const mac = new qiniu.auth.digest.Mac(QINIU.accessKey, QINIU.secretKey);
    const config = new qiniu.conf.Config();
    config.useHttpsDomain = true;
    config.useCdnDomain = true;
    const bucketManager = new qiniu.rs.BucketManager(mac, config);
    const formUploader = new qiniu.form_up.FormUploader(config);
    const putExtra = new qiniu.form_up.PutExtra();
    return { mac, bucketManager, formUploader, putExtra };
}

/**
 * 构造对象 key：类型/文件名
 * @param {Express.Multer.File} file
 * @param {{resourceType: string}} meta
 */
function buildKey(file, { resourceType }) {
    return `${resourceType}/${file.filename}`;
}

/**
 * 服务端中转上传（multer 已落盘的临时文件 → 七牛 → 删除临时文件）
 */
export async function putFile(file, meta) {
    const { mac, formUploader, putExtra } = getClients();
    const key = buildKey(file, meta);

    const options = { scope: `${QINIU.bucket}:${key}`, expires: QINIU.tokenExpires };
    const token = new qiniu.rs.PutPolicy(options).uploadToken(mac);

    await new Promise((resolve, reject) => {
        formUploader.putStream(
            token,
            key,
            fs.createReadStream(file.path),
            putExtra,
            (err, body, info) => {
                if (err) return reject(err);
                if (info.statusCode !== 200) {
                    return reject(new Error(`上传到七牛失败：HTTP ${info.statusCode}`));
                }
                resolve(body);
            }
        );
    });

    // 云端上传成功后删除本地临时文件
    await fs.promises.unlink(file.path).catch(() => {});

    return {
        provider: 'qiniu',
        file_name: file.filename,
        file_path: `${QINIU.domain}/${key}`,
        origin_name: file.originalname,
        key
    };
}

export async function putFiles(files, meta) {
    const { mac, formUploader, putExtra } = getClients();

    return Promise.all(
        files.map(async file => {
            const key = buildKey(file, meta);
            const options = { scope: `${QINIU.bucket}:${key}`, expires: QINIU.tokenExpires };
            const token = new qiniu.rs.PutPolicy(options).uploadToken(mac);

            const body = await new Promise((resolve, reject) => {
                formUploader.putStream(
                    token,
                    key,
                    fs.createReadStream(file.path),
                    putExtra,
                    (err, respBody, info) => {
                        if (err) return reject(err);
                        if (info.statusCode !== 200) {
                            return reject(new Error(`上传到七牛失败：HTTP ${info.statusCode}`));
                        }
                        resolve(respBody);
                    }
                );
            });

            await fs.promises.unlink(file.path).catch(() => {});

            return {
                provider: 'qiniu',
                file_name: file.filename,
                file_path: `${QINIU.domain}/${key}`,
                origin_name: file.originalname,
                key
            };
        })
    );
}

/**
 * 删除云端文件
 * @param {string} filePath 完整 URL 或 key
 */
export async function removeFile(filePath) {
    if (!filePath) return;
    const { bucketManager } = getClients();
    const key = extractKey(filePath);

    await new Promise((resolve, reject) => {
        bucketManager.delete(QINIU.bucket, key, err => (err ? reject(err) : resolve()));
    });
}

/**
 * 签发前端直传凭证
 * @param {{resourceType: string, keySuffix?: string}} params
 * @returns {{token: string, key: string, domain: string, expires: number}}
 */
export function buildUploadToken({ resourceType = 'image' } = {}) {
    const { mac } = getClients();
    assertQiniuConfig();

    const key = `${resourceType}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const options = { scope: `${QINIU.bucket}:${key}`, expires: QINIU.tokenExpires };

    return {
        token: new qiniu.rs.PutPolicy(options).uploadToken(mac),
        key,
        domain: QINIU.domain,
        expires: QINIU.tokenExpires
    };
}
