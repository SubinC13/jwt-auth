import { Router } from 'express';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema } from '../validation/schemas';
import { login, register } from '../controllers/authController';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

export default router;


