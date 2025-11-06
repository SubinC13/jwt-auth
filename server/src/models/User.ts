import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'admin' | 'customer';

export interface UserDocument extends Document {
  name: string;
  email: string;
  role: UserRole;
  passwordHash: string;
  comparePassword: (password: string) => Promise<boolean>;
}

const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    role: { type: String, enum: ['admin', 'customer'], default: 'customer', index: true },
    passwordHash: { type: String, required: true }
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.passwordHash);
};

export const UserModel = mongoose.model<UserDocument>('User', UserSchema);


