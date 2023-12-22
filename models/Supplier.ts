import mongoose, { Schema } from 'mongoose';
import { ISupplier } from '../interfaces/interfaces';
import { validatePhoneNumber } from '../helpers/validate-schema-properties';
import validator from 'validator';

const supplierSchema = new Schema<ISupplier>(
  {
    firstName: {
      type: String,
      required: [true, 'Please provide a first name for the supplier.'],
      unique: true,
      minlength: 3,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: [true, 'Please provide a last name for the supplier.'],
      unique: true,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      minlength: 7,
      maxlength: 35,
      validate: [validator.isEmail, 'Please provide a valid email address.'],
    },
    phone: {
      type: Number,
      unique: true,
      sparse: true,
      validate: [
        validatePhoneNumber,
        'Invalid phone number, must be 10 digits.',
      ],
    },
    address: {
      type: String,
      unique: true,
      sparse: true,
    },
    expenses: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Expense' }],
      default: [],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: [true, 'Please provide a the creator.'],
      ref: 'User',
    },
    company: {
      type: Schema.Types.ObjectId,
      required: [true, 'Please provide a the company.'],
      ref: 'Company',
    },
  },
  { timestamps: true, versionKey: false }
);

const Supplier = mongoose.model<ISupplier>('Supplier', supplierSchema);

export default Supplier;
