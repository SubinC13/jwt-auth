import { Request, Response } from 'express';
import { TransactionModel } from '../models/Transaction';
import { OrderModel } from '../models/Order';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';

export async function createTransaction(req: Request, res: Response) {
  const { transactionId, orderId, amount, paymentMethod, timestamp } = req.body as any;

  const order = await OrderModel.findOne({ _id: orderId });
  if (!order) return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid orderId' });

  const t = await TransactionModel.create({
    transactionId,
    orderId: new mongoose.Types.ObjectId(orderId),
    amount,
    paymentMethod,
    timestamp: new Date(timestamp)
  });

  const io = req.app.get('io');
  io.emit('transaction:new', {
    transactionId: t.transactionId,
    orderId: String(t.orderId),
    amount: t.amount,
    paymentMethod: t.paymentMethod,
    timestamp: t.timestamp
  });

  return res.status(StatusCodes.CREATED).json(t);
}

export async function listTransactions(_req: Request, res: Response) {
  const tx = await TransactionModel.find({}).sort({ createdAt: -1 }).lean();
  return res.json(tx);
}


