import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['admin', 'customer']).optional()
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6)
  })
});

export const createOrderSchema = z.object({
  body: z.object({
    orderId: z.string().min(1),
    items: z
      .array(
        z.object({
          productId: z.string().min(1),
          name: z.string().min(1),
          quantity: z.number().int().positive(),
          price: z.number().nonnegative()
        })
      )
      .min(1),
    totalAmount: z.number().nonnegative()
  })
});

export const listOrdersSchema = z.object({
  query: z.object({ status: z.enum(['Pending', 'Completed', 'Failed']).optional() })
});

export const patchOrderSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({ status: z.enum(['Pending', 'Completed', 'Failed']) })
});

export const createTransactionSchema = z.object({
  body: z.object({
    transactionId: z.string().min(1),
    orderId: z.string().min(1),
    amount: z.number().nonnegative(),
    paymentMethod: z.string().min(1),
    timestamp: z.string().or(z.date())
  })
});


