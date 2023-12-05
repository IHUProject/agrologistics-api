import mongoose, { Schema } from 'mongoose';
import { IAccountant } from '../interfaces/interfaces';

const accountSchema: mongoose.Schema<IAccountant> = new Schema<IAccountant>(
  {
    firstName: { type: String, default: null, minlength: 3, maxlength: 35 },
    lastName: { type: String, default: null, minlength: 3, maxlength: 35 },
    phone: { type: Number, default: null, minlength: 10, maxlength: 10 },
    email: { type: String, required: true, minlength: 7, maxlength: 35 },
    address: { type: String, default: null, minlength: 5, maxlength: 35 },
    company: { type: Schema.Types.ObjectId, ref: 'Company' },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
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
