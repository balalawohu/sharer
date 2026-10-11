// Introduce：用户路由
import * as users from '../controllers/user.controller.js';
import { Router } from 'express';

const router = Router();

router.post('/login', users.login);
router.post('/register', users.register);
router.post('/logout', users.logout);

export default router;

