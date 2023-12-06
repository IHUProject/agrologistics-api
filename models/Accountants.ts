import mongoose, { Schema } from 'mongoose';
import { IAccountant } from '../interfaces/interfaces';
import validator from 'validator';

const accountSchema: mongoose.Schema<IAccountant> = new Schema<IAccountant>(
  {
    firstName: { type: String, default: null, minlength: 3, maxlength: 35 },
    lastName: { type: String, default: null, minlength: 3, maxlength: 35 },
    phone: {
      type: Number,
      unique: true,
      default: null,
      validate: {
        validator: function (value: string | number) {
          return /^[0-9]{10}$/.test(String(value));
        },
        message: (props) => `${props.value} is not a valid phone number`,
      },
    },
    email: {
      type: String,
      unique: true,
      required: [true, 'please provide an email'],
      minlength: 7,
      maxlength: 35,
      validate: [validator.isEmail, 'please provide a valid email address'],
    },
    address: { type: String, default: null, minlength: 5, maxlength: 35 },
    company: { type: Schema.Types.ObjectId, ref: 'Company' },
    latitude: {
      type: Number,
      default: null,
      validate: {
        validator: function (value: number) {
          return typeof value === 'number' && value >= -90 && value <= 90;
        },
        message: (props) =>
          `${props.value} is not a valid latitude! Latitude must be a number between -90 and 90.`,
      },
    },
    longitude: {
      type: Number,
      default: null,
      validate: {
        validator: function (value: number) {
          return typeof value === 'number' && value >= -180 && value <= 180;
        },
        message: (props) =>
          `${props.value} is not a valid longitude! Longitude must be a number between -180 and 180.`,
      },
    },
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
