import mongoose, { Schema } from 'mongoose';
import { IAccountant } from '../interfaces/interfaces';
import validator from 'validator';

const accountantSchema: mongoose.Schema<IAccountant> = new Schema<IAccountant>(
  {
    firstName: { type: String, default: null, minlength: 3, maxlength: 35 },
    lastName: { type: String, default: null, minlength: 3, maxlength: 35 },
    phone: {
      type: String,
      unique: true,
      default: null,
      validate: {
        validator: function (value: string) {
          return /^[0-9]{10}$/.test(value);
        },
        message: (props) => `${props.value} is not a valid phone number.`,
      },
    },
    email: {
      type: String,
      unique: true,
      required: [true, 'Please provide an email.'],
      minlength: 7,
      maxlength: 35,
      validate: [validator.isEmail, 'Please provide a valid email address.'],
    },
    address: { type: String, default: null, minlength: 5, maxlength: 35 },
    company: { type: Schema.Types.ObjectId, ref: 'Company' },
    updatedBy: { type: Schema.Types.ObjectId, default: null, ref: 'User' },
    latitude: {
      type: String,
      default: null,
      validate: {
        validator: function (value: string) {
          const numValue = parseFloat(value);
          return (
            !isNaN(numValue) &&
            value === numValue.toString() &&
            numValue >= -90 &&
            numValue <= 90
          );
        },
        message: (props) =>
          `${props.value} is not a valid latitude, latitude must be a number between -90 and 90.`,
      },
    },
    longitude: {
      type: String,
      default: null,
      validate: {
        validator: function (value: string) {
          const numValue = parseFloat(value);
          return (
            !isNaN(numValue) &&
            value === numValue.toString() &&
            numValue >= -180 &&
            numValue <= 180
          );
        },
        message: (props) =>
          `${props.value} is not a valid longitude, longitude must be a number between -180 and 180.`,
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Accountant: mongoose.Model<IAccountant> = mongoose.model<IAccountant>(
  'Accountant',
  accountantSchema,
  'Accountants'
);

export default Accountant;
