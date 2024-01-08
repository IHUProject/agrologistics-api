import mongoose, { Schema } from 'mongoose';
import { IExpense } from '../interfaces/interfaces';

const expenseSchema = new Schema<IExpense>(
  {
    totalAmount: {
      type: Number,
    },
  },
  { timestamps: true, versionKey: false }
);

const Expanse = mongoose.model<IExpense>('Expanse', expenseSchema);

export default Expanse;
