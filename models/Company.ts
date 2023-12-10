import mongoose, { Schema } from 'mongoose';
import { ICompany } from '../interfaces/interfaces';
import { DefaultImage } from '../interfaces/enums';
import {
  validateDate,
  validateLatitude,
  validateLongitude,
  validatePhoneNumber,
} from '../helpers/validate-schema-properties';

const companySchema: mongoose.Schema<ICompany> = new Schema<ICompany>(
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
    owner: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    afm: {
      type: Number,
      unique: true,
      required: [true, 'Please provide AFM.'],
      validate: {
        validator: function (value: number) {
          return /^[0-9]{9}$/.test(value.toString());
        },
        message: (props) => `${props.value} is not a valid AFM.`,
      },
    },
    logo: { type: String, default: DefaultImage.LOGO },
    founded: {
      type: Date,
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
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Company: mongoose.Model<ICompany> = mongoose.model<ICompany>(
  'Company',
  companySchema,
  'Companies'
);

export default Company;
