import { Request, Response, NextFunction } from 'express';
import { OrderModel } from '../models/Order';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';

export async function createOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const { orderId, items, totalAmount } = req.body as any;
    const userId = req.user!.userId;

    const existing = await OrderModel.findOne({ orderId }).lean();
    if (existing) {
      return res.status(StatusCodes.CONFLICT).json({ error: 'orderId already exists' });
    }

    const order = await OrderModel.create({
      orderId,
      userId: new mongoose.Types.ObjectId(userId),
      items,
      totalAmount,
      status: 'Pending'
    });
    return res.status(StatusCodes.CREATED).json(order);
  } catch (err) {
    next(err);
  }
}

export async function listOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = req.query as { status?: 'Pending' | 'Completed' | 'Failed' };
    const filter: any = {};
    if (status) filter.status = status;
    if (req.user!.role !== 'admin') {
      filter.userId = req.user!.userId;
    }
    const orders = await OrderModel.find(filter).sort({ createdAt: -1 }).lean();
    return res.json(orders);
  } catch (err) {
    next(err);
  }
}

export async function patchOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params as { id: string };
    const { status } = req.body as { status: 'Pending' | 'Completed' | 'Failed' };

    const order = await OrderModel.findById(id);
    if (!order) return res.status(StatusCodes.NOT_FOUND).json({ error: 'Order not found' });

    if (req.user!.role !== 'admin' && String(order.userId) !== req.user!.userId) {
      return res.status(StatusCodes.FORBIDDEN).json({ error: 'Forbidden' });
    }

    order.status = status;
    await order.save();
    return res.json(order);
  } catch (err) {
    next(err);
  }
}


