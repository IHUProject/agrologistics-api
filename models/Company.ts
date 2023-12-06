import mongoose, { Schema } from 'mongoose';
import { ICompany } from '../interfaces/interfaces';
import { DefaultImage } from '../interfaces/enums';
import { validateDate } from '../helpers/validate-schema-properties';

const companySchema: mongoose.Schema<ICompany> = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: [true, 'Please provide company name.'],
      minlength: 3,
      maxlength: 35,
    },
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
    address: { type: String, minlength: 5, maxlength: 35 },
    owner: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    afm: {
      type: String,
      unique: true,
      required: [true, 'Please provide AFM.'],
      validate: {
        validator: function (value: string) {
          return /^[0-9]{9}$/.test(value);
        },
        message: (props) => `${props.value} is not a valid AFM.`,
      },
    },
    logo: { type: String, default: DefaultImage.LOGO },
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

const Company: mongoose.Model<ICompany> = mongoose.model<ICompany>(
  'Company',
  companySchema,
  'Companies'
);

export default Company;
