// Introduce：上传路由
import { Router } from 'express';
import * as uploadController from '../controllers/upload.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { upload, MAX_FILE_COUNT } from '../config/upload.js';

const router = Router();

// 上传相关接口均需登录
router.use(authMiddleware);

// 前端直传（七牛云模式）：先取凭证，再登记
router.get('/token', uploadController.getUploadToken);
router.post('/direct', uploadController.saveDirect);

// multipart/form-data 字段名统一为 files，单张/多张共用
router.post('/image', upload.array('files', MAX_FILE_COUNT), uploadController.uploadImage);
router.post('/audio', upload.array('files', MAX_FILE_COUNT), uploadController.uploadAudio);
router.post('/video', upload.array('files', MAX_FILE_COUNT), uploadController.uploadVideo);

// 我的资源列表 / 删除
router.get('/list', uploadController.myResources);
router.delete('/:id', uploadController.deleteResource);

export default router;
