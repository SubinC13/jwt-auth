import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createOrderSchema, listOrdersSchema, patchOrderSchema } from '../validation/schemas';
import { createOrder, listOrders, patchOrder } from '../controllers/orderController';

const router = Router();

router.post('/', requireAuth, validate(createOrderSchema), createOrder);
router.get('/', requireAuth, validate(listOrdersSchema), listOrders);
router.patch('/:id', requireAuth, validate(patchOrderSchema), patchOrder);

export default router;


