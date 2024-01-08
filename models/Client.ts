import mongoose, { Schema } from 'mongoose';
import { validatePhoneNumber } from '../helpers/validate-schema-properties';
import { IClient } from '../interfaces/interfaces';

const clientSchema = new Schema<IClient>(
  {
    firstName: {
      type: String,
      required: [true, 'Provide first name name for the client.'],
      minlength: 3,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: [true, 'Provide last  name name for the client.'],
      minlength: 3,
      maxlength: 50,
    },
    address: { type: String, minlength: 3, maxlength: 50, default: null },
    phone: {
      type: Number,
      unique: true,
      sparse: true,
      validate: [
        validatePhoneNumber,
        'Invalid phone number, must be 10 digits.',
      ],
    },
    purchases: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Purchase' }],
      default: [],
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

const Client = mongoose.model<IClient>('Client', clientSchema);

export default Client;
