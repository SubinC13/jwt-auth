import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createTransactionSchema } from '../validation/schemas';
import { createTransaction, listTransactions } from '../controllers/transactionController';

const router = Router();

router.post('/', requireAuth, validate(createTransactionSchema), createTransaction);
router.get('/', requireAuth, requireRole(['admin']), listTransactions);

export default router;


