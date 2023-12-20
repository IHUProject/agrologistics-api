import mongoose, { Schema } from 'mongoose';
import { ICompany } from '../interfaces/interfaces';
import {
  validateAFM,
  validateDate,
  validateLatitude,
  validateLongitude,
  validatePhoneNumber,
} from '../helpers/validate-schema-properties';
import { DefaultImage } from '../interfaces/enums';

const companySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: [true, 'Please provide company name.'],
      minlength: 3,
      maxlength: 35,
    },
    phone: {
      type: Number,
      unique: true,
      default: null,
      validate: {
        validator: validatePhoneNumber,
        message: 'Invalid phone number, must be 10 digits.',
      },
    },
    address: { type: String, minlength: 5, maxlength: 35 },
    afm: {
      type: Number,
      required: [true, 'Please provide AFM.'],
      validate: {
        validator: validateAFM,
        message: (props) => `${props.value} is not a valid AFM.`,
      },
    },
    logo: {
      link: { type: String, default: DefaultImage.PROFILE_IMAGE },
      deletehash: { type: String, default: '' },
    },
    founded: {
      type: String,
      default: null,
      validate: {
        validator: validateDate,
        message: (props) =>
          `${props.value} is not a valid date, please use the format DD/MM/YYYY.`,
      },
    },
    latitude: {
      type: Number,
      default: null,
      validate: {
        validator: validateLatitude,
        message: (props) =>
          `${props.value} is not a valid latitude, latitude must be a number between -90 and 90.`,
      },
    },
    longitude: {
      type: Number,
      default: null,
      validate: {
        validator: validateLongitude,
        message: (props) =>
          `${props.value} is not a valid longitude, longitude must be a number between -180 and 180.`,
      },
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide an owner.'],
    },
    employees: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
    accountant: {
      type: Schema.Types.ObjectId,
      ref: 'Accountant',
      default: null,
    },
    products: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
      default: [],
    },
    suppliers: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Supplier' }],
      default: [],
    },
    purchases: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Purchase' }],
      default: [],
    },
    clients: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Client' }],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Company = mongoose.model<ICompany>('Company', companySchema, 'Companies');

export default Company;
