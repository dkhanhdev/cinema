import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { updateUserRoleSchema } from '../validators/index.js';
import { UserRole } from '../constants/index.js';

const router = Router();

router.get('/', authenticate, authorize([UserRole.ADMIN]), UserController.getAll);
router.get('/:id', authenticate, authorize([UserRole.ADMIN]), UserController.getById);
router.put('/:id/role', authenticate, authorize([UserRole.ADMIN]), validateBody(updateUserRoleSchema), UserController.updateRole);
router.delete('/:id', authenticate, authorize([UserRole.ADMIN]), UserController.delete);

export const userRoutes = router;
