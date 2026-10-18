// API：上传与资源模块
// 注意：url 不带 /api 前缀，baseURL 已包含 http://localhost:3000/api
import request from '../request';

export const uploadAPI = {
    /**
     * 上传图片（支持多张）
     * @param {FormData} formData 字段名 files
     */
    uploadImage(formData) {
        return request({
            url: '/upload/image',
            method: 'post',
            data: formData,
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    /** 上传音频 */
    uploadAudio(formData) {
        return request({
            url: '/upload/audio',
            method: 'post',
            data: formData,
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    /** 上传视频 */
    uploadVideo(formData) {
        return request({
            url: '/upload/video',
            method: 'post',
            data: formData,
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    /**
     * 我的资源列表
     * @param {{page?: number, pageSize?: number, resourceType?: string}} params
     */
    myResources(params) {
        return request({
            url: '/upload/list',
            method: 'get',
            params
        });
    },

    /** 删除资源（软删除） */
    remove(id) {
        return request({
            url: `/upload/${id}`,
            method: 'delete'
        });
    },

    /**
     * 获取前端直传凭证（七牛云模式）
     * @param {string} resourceType
     */
    getToken(resourceType = 'image') {
        return request({
            url: '/upload/token',
            method: 'get',
            params: { resourceType }
        });
    },

    /** 直传成功后登记资源 */
    saveDirect(data) {
        return request({
            url: '/upload/direct',
            method: 'post',
            data
        });
    }
};
