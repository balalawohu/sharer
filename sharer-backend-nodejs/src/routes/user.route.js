// Introduce：用户路由
import * as users from '../controllers/user.controller.js';
import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/login', users.login);
router.post('/register', users.register);
router.post('/logout', users.logout);

// 获取当前登录用户信息（需鉴权）
router.get('/profile', authMiddleware, users.getProfile);

export default router;

