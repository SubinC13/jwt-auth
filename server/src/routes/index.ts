import { Router } from 'express';
import authRoutes from './authRoutes';
import orderRoutes from './orderRoutes';
import transactionRoutes from './transactionRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/orders', orderRoutes);
router.use('/transactions', transactionRoutes);

export default router;


