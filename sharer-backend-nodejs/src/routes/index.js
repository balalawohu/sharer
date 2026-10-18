import user from './user.route.js';
import upload from './upload.route.js';
import { Router } from 'express';

const router = Router();

router.use('/user', user);
router.use('/upload', upload);

export default router;
