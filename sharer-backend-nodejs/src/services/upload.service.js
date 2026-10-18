// Service：文件上传业务逻辑层
// 不直接操作磁盘/云存储，统一调用 storage 门面，可实现 local / qiniu 无感切换
import Resource from '../models/resource.model.js';
import { resolveResourceType } from '../config/upload.js';
import { putFiles, putFile, removeFile } from './storage/index.js';
import { ServiceError } from './user.service.js';

/**
 * 把单个已接收的文件写入资源表
 * @param {Express.Multer.File} file multer 产出的文件对象
 * @param {{userId: number, title?: string, description?: string, tags?: string, visibility?: number}} meta
 * @returns {Promise<object>} 资源记录
 */
export async function saveResource(file, meta) {
    const resourceType = resolveResourceType(file.mimetype);

    // 写入存储服务（本地磁盘或七牛云）
    const stored = await putFile(file, { resourceType });

    try {
        const resource = await Resource.create({
            user_id: meta.userId,
            title: (meta.title || '').trim() || file.originalname.replace(/\.[^.]+$/, ''),
            description: meta.description || null,
            resource_type: resourceType,
            mime_type: file.mimetype,
            file_name: stored.file_name,
            origin_name: file.originalname,
            file_path: stored.file_path, // 本地：/uploads/image/xxx.png；七牛：完整 URL
            file_size: file.size,
            tags: meta.tags || null,
            visibility: Number(meta.visibility) === 0 ? 0 : 1
        });

        return resource.toJSON();
    } catch (error) {
        // 落库失败，删除已写入存储服务的文件，避免产生孤儿文件
        await removeFile(stored.file_path).catch(() => {});
        throw error;
    }
}

/**
 * 批量保存上传文件
 * @param {Express.Multer.File[]} files
 * @param {object} meta 同 saveResource
 * @returns {Promise<object[]>}
 */
export async function saveResources(files, meta) {
    const resourceType = files[0] ? resolveResourceType(files[0].mimetype) : 'image';

    const storedList = await putFiles(files, { resourceType });

    try {
        const created = await Resource.bulkCreate(
            storedList.map((stored, index) => {
                const file = files[index];
                return {
                    user_id: meta.userId,
                    title:
                        (meta.title || '').trim() ||
                        file.originalname.replace(/\.[^.]+$/, '') ||
                        stored.file_name,
                    description: meta.description || null,
                    resource_type: resolveResourceType(file.mimetype),
                    mime_type: file.mimetype,
                    file_name: stored.file_name,
                    origin_name: file.originalname,
                    file_path: stored.file_path,
                    file_size: file.size,
                    tags: meta.tags || null,
                    visibility: Number(meta.visibility) === 0 ? 0 : 1
                };
            })
        );

        return created.map(r => r.toJSON());
    } catch (error) {
        await Promise.all(storedList.map(s => removeFile(s.file_path).catch(() => {})));
        throw error;
    }
}

/**
 * 前端直传七牛后回调落库：文件已在云端，这里只登记一条记录
 * @param {{userId: number, file_path: string, file_name: string, origin_name: string,
 *          mime_type: string, file_size: number, resource_type: string,
 *          title?: string, description?: string, tags?: string, visibility?: number}} params
 */
export async function saveDirectResource(params) {
    return Resource.create({
        user_id: params.userId,
        title: (params.title || '').trim() || params.origin_name.replace(/\.[^.]+$/, ''),
        description: params.description || null,
        resource_type: params.resource_type || resolveResourceType(params.mime_type),
        mime_type: params.mime_type,
        file_name: params.file_name,
        origin_name: params.origin_name,
        file_path: params.file_path,
        file_size: params.file_size || 0,
        tags: params.tags || null,
        visibility: Number(params.visibility) === 0 ? 0 : 1
    }).then(r => r.toJSON());
}

/**
 * 查询我的资源列表（分页 + 类型筛选）
 * @param {{userId: number, page?: number, pageSize?: number, resourceType?: string}} params
 */
export async function listMyResources({ userId, page = 1, pageSize = 20, resourceType }) {
    const where = { user_id: userId, status: 1 };
    if (resourceType) where.resource_type = resourceType;

    const { count, rows } = await Resource.findAndCountAll({
        where,
        order: [['created_at', 'DESC']],
        offset: (Number(page) - 1) * Number(pageSize),
        limit: Number(pageSize)
    });

    return {
        total: count,
        page: Number(page),
        pageSize: Number(pageSize),
        list: rows.map(r => r.toJSON())
    };
}

/**
 * 删除资源：软删除（status 置 0）
 * @param {{resourceId: number, userId: number}} params
 */
export async function removeResource({ resourceId, userId }) {
    const resource = await Resource.findOne({
        where: { id: resourceId, user_id: userId, status: 1 }
    });
    if (!resource) throw new ServiceError('资源不存在或无权限删除', 404);

    await resource.update({ status: 0 });
    return { id: resource.id };
}
