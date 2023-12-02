import mongoose, { Schema } from 'mongoose';
import { IAccountant } from '../interfaces/interfaces';

const accountSchema: mongoose.Schema<IAccountant> = new Schema<IAccountant>(
  {
    firstName: { type: String },
    lastName: { type: String },
    phone: { type: Number, unique: true },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    address: { type: String },
    company: { type: Schema.Types.ObjectId, ref: 'User' },
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
