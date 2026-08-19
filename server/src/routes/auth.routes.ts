import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { registerSchema, loginSchema, updateProfileSchema } from '../validators/index.js';

const router = Router();

router.post('/register', validateBody(registerSchema), AuthController.register);
router.post('/login', validateBody(loginSchema), AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.get('/me', authenticate, AuthController.getMe);
router.put('/me', authenticate, validateBody(updateProfileSchema), AuthController.updateMe);

export const authRoutes = router;
