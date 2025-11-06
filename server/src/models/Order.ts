import mongoose, { Schema, Document, Types } from 'mongoose';

export type OrderStatus = 'Pending' | 'Completed' | 'Failed';

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface OrderDocument extends Document {
  orderId: string;
  userId: Types.ObjectId;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
}

const OrderItemSchema = new Schema<OrderItem>(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const OrderSchema = new Schema<OrderDocument>(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [OrderItemSchema], required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending', index: true }
  },
  { timestamps: true }
);

export const OrderModel = mongoose.model<OrderDocument>('Order', OrderSchema);


