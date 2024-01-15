import mongoose, { Schema } from 'mongoose';
import { IExpense } from '../interfaces/interfaces';
import { DefaultImage, PaymentMethod } from '../interfaces/enums';
import { validateDate } from '../helpers/validate-schema-properties';

const expenseSchema = new Schema<IExpense>(
  {
    totalAmount: {
      type: Number,
      required: [true, 'Please provide the total amount.'],
    },
    paymentMethod: {
      type: String,
      enum: {
        values: Object.values(PaymentMethod),
        message: '{VALUE} is not a valid payment method',
      },
      default: PaymentMethod.OTHER,
    },
    date: {
      type: Date,
      default: null,
      validate: {
        validator: validateDate,
        message: (props) =>
          `${props.value} is not a valid date, please use the format YYYY/MM/DD.`,
      },
    },
    description: {
      type: String,
      default: null,
    },
    images: {
      type: [
        {
          link: { type: String },
          deletehash: { type: String },
        },
      ],
      default: [{ link: DefaultImage.EXPENSE_IMAGE, deletehash: '' }],
    },
    category: {
      type: String,
      default: null,
    },
    supplier: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Please provide supplier.'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: [true, 'Please provide the creator.'],
      ref: 'User',
    },
    company: {
      type: Schema.Types.ObjectId,
      required: [true, 'Please provide the company.'],
      ref: 'Company',
    },
  },
  { timestamps: true, versionKey: false }
);

const Expanse = mongoose.model<IExpense>('Expanse', expenseSchema);

export default Expanse;
