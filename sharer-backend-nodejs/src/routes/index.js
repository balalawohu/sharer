import user from './user.route.js';
import { Router } from 'express';

const router = Router();

router.use('/user', user);

export default router;
