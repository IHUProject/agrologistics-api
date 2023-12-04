import mongoose, { Schema } from 'mongoose';
import { IAccountant } from '../interfaces/interfaces';

const accountSchema: mongoose.Schema<IAccountant> = new Schema<IAccountant>(
  {
    firstName: String,
    lastName: String,
    phone: Number,
    email: { type: String, required: true },
    address: String,
    company: { type: Schema.Types.ObjectId, ref: 'Company' },
    latitude: Number,
    longitude: Number,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Account: mongoose.Model<IAccountant> = mongoose.model<IAccountant>(
  'Accountant',
  accountSchema,
  'Accountants'
);

export default Account;
