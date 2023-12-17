import mongoose, { Schema } from 'mongoose';
import { validatePhoneNumber } from '../helpers/validate-schema-properties';
import { IClient } from '../interfaces/interfaces';

const clientSchema = new Schema<IClient>(
  {
    fullName: {
      type: String,
      required: [true, 'Provide full name name for the client.'],
      minlength: 3,
      maxlength: 50,
    },
    company: { type: String, minlength: 3, maxlength: 50, default: null },
    address: { type: String, minlength: 3, maxlength: 50, default: null },
    phone: {
      type: Number,
      unique: true,
      sparse: true,
      validate: {
        validator: validatePhoneNumber,
        message: 'Invalid phone number, must be 10 digits.',
      },
    },
    purchases: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Purchase' }],
      default: [],
    },
  },
  { timestamps: true, versionKey: false }
);

const Client = mongoose.model<IClient>('Client', clientSchema, 'Clients');

export default Client;
