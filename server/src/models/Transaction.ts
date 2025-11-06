import mongoose, { Schema, Document, Types } from 'mongoose';

export interface TransactionDocument extends Document {
  transactionId: string;
  orderId: Types.ObjectId;
  amount: number;
  paymentMethod: string;
  timestamp: Date;
}

const TransactionSchema = new Schema<TransactionDocument>(
  {
    transactionId: { type: String, required: true, unique: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, required: true },
    timestamp: { type: Date, required: true }
  },
  { timestamps: true }
);

export const TransactionModel = mongoose.model<TransactionDocument>('Transaction', TransactionSchema);


