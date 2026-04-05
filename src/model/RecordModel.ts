import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './UserModel';

export enum RecordType {
  Income = 'Income',
  Expense = 'Expense',
}

export interface IFinanceRecord extends Document {
  amount: number;
  type: RecordType;
  category: string;
  date: Date;
  notes?: string;
  createdBy: IUser['_id'];
}

const recordSchema = new Schema<IFinanceRecord>(
  {
    amount: { type: Number, required: true },
    type: {
      type: String,
      enum: Object.values(RecordType),
      required: true,
    },
    category: { type: String, required: true },
    date: { type: Date, required: true, index: true },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Indexes to speed up dashboard queries
recordSchema.index({ type: 1, category: 1 });
recordSchema.index({ date: 1 });

export const RecordModel = mongoose.model<IFinanceRecord>('FinanceRecord', recordSchema);
