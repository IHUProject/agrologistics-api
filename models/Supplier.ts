import mongoose, { Schema } from 'mongoose';
import { ISupplier } from '../interfaces/interfaces';

const supplierSchema = new Schema<ISupplier>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name for the supplier.'],
      unique: true,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      unique: true,
      default: null,
    },
    phone: {
      type: String,
      unique: true,
      default: null,
    },
    address: {
      type: String,
      unique: true,
      default: null,
    },
    products: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
      default: [],
    },
  },
  { timestamps: true, versionKey: false }
);

const Supplier = mongoose.model<ISupplier>(
  'Supplier',
  supplierSchema,
  'Suppliers'
);

export default Supplier;
