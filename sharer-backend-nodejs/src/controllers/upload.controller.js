// Controller：文件上传控制器
// 职责：取参数 → 调服务层 → 统一响应；文件由 multer 中间件接收并落盘，
//       本控制器负责把落盘结果写入数据库，失败时清理磁盘文件
//
// 说明：上传会按类型（图片/音频/视频）分别到不同接口；
//       规划中的 file.controller.js 将负责资源的增删改查。
import fs from 'fs/promises';
import {
    saveResources,
    listMyResources,
    removeResource,
    saveDirectResource
} from '../services/upload.service.js';
import { buildUploadToken, currentDriver } from '../services/storage/index.js';
import { ServiceError } from '../services/user.service.js';

/**
 * 清理 multer 产生的本地临时文件（无论是否使用云端存储，multer 都会先落盘）
 * @param {Express.Multer.File[]} files
 */
async function removeLocalTemp(files = []) {
    await Promise.all(files.map(file => fs.unlink(file.path).catch(() => {})));
}

/**
 * 通用上传处理：单文件与多文件共用
 * @param {string} expectedType 期望的资源类型 image/audio/video，用于校验
 */
async function handleUpload(req, res, expectedType) {
    const files = req.files || (req.file ? [req.file] : []);

    if (!files.length) return res.fail('请选择要上传的文件', 400);

    // 兜底：multer 已做类型过滤，这里再确认一次（防止配置调整后放行 other）
    const invalid = files.find(f => f.mimetype.split('/')[0] !== expectedType);
    if (invalid) {
        await removeLocalTemp(files);
        return res.fail(`资源类型不匹配，该接口仅支持 ${expectedType}`, 400);
    }

    const { title, description, tags, visibility } = req.body;

    try {
        const meta = { userId: req.user.id, title, description, tags, visibility };
        const resources = await saveResources(files, meta);

        return res.ok(resources.length === 1 ? resources[0] : resources, '上传成功');
    } catch (error) {
        // 存储服务写入失败时，清理 multer 产生的本地临时文件
        await removeLocalTemp(files);
        if (error instanceof ServiceError) return res.fail(error.message, error.code);
        console.error('[上传失败]', error);
        return res.fail('上传失败，请稍后重试', 500);
    }
}

/**
 * 获取前端直传凭证（仅七牛云模式）
 * 前端拿到 token 后可直接把文件传到七牛，无需经过后端中转
 */
export async function getUploadToken(req, res) {
    if (currentDriver !== 'qiniu') {
        return res.fail('当前为本地存储模式，不支持直传凭证', 400);
    }

    try {
        const { resourceType = 'image' } = req.query;
        const credential = buildUploadToken({ resourceType });
        return res.ok(credential, '获取上传凭证成功');
    } catch (error) {
        console.error('[签发上传凭证失败]', error);
        return res.fail('获取上传凭证失败：' + error.message, 500);
    }
}

/**
 * 前端直传成功后登记资源
 * 文件已在云端，这里只写入一条资源记录
 */
export async function saveDirect(req, res) {
    const {
        file_path,
        file_name,
        origin_name,
        mime_type,
        file_size,
        resource_type,
        title,
        description,
        tags,
        visibility
    } = req.body;

    if (!file_path || !origin_name) {
        return res.fail('缺少必要参数：file_path、origin_name', 400);
    }

    try {
        const resource = await saveDirectResource({
            userId: req.user.id,
            file_path,
            file_name: file_name || file_path.split('/').pop(),
            origin_name,
            mime_type: mime_type || '',
            file_size: Number(file_size) || 0,
            resource_type,
            title,
            description,
            tags,
            visibility
        });
        return res.ok(resource, '登记成功');
    } catch (error) {
        console.error('[直传登记失败]', error);
        return res.fail('登记失败，请稍后重试', 500);
    }
}

// ---------- 上传图片（支持多张，表情包场景常用） ----------
export async function uploadImage(req, res) {
    return handleUpload(req, res, 'image');
}

// ---------- 上传音频 ----------
export async function uploadAudio(req, res) {
    return handleUpload(req, res, 'audio');
}

// ---------- 上传视频 ----------
export async function uploadVideo(req, res) {
    return handleUpload(req, res, 'video');
}

// ---------- 我的资源列表 ----------
export async function myResources(req, res) {
    const { page, pageSize, resourceType } = req.query;

    try {
        const data = await listMyResources({
            userId: req.user.id,
            page,
            pageSize,
            resourceType
        });
        return res.ok(data, '查询成功');
    } catch (error) {
        console.error('[查询资源列表失败]', error);
        return res.fail('查询失败，请稍后重试', 500);
    }
}

// ---------- 删除资源 ----------
export async function deleteResource(req, res) {
    const { id } = req.params;

    try {
        const result = await removeResource({ resourceId: id, userId: req.user.id });
        return res.ok(result, '删除成功');
    } catch (error) {
        if (error instanceof ServiceError) return res.fail(error.message, error.code);
        console.error('[删除资源失败]', error);
        return res.fail('删除失败，请稍后重试', 500);
    }
}
