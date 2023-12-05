import mongoose, { Schema } from 'mongoose';
import { ICompany } from '../interfaces/interfaces';

const companySchema: mongoose.Schema<ICompany> = new Schema<ICompany>(
  {
    name: { type: String, required: true, minlength: 3, maxlength: 35 },
    phone: { type: Number, unique: true, minlength: 10, maxlength: 10 },
    address: { type: String, minlength: 5, maxlength: 35 },
    owner: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    afm: {
      type: Number,
      unique: true,
      required: true,
      minlength: 9,
      maxlength: 9,
    },
    logo: { type: String, default: null },
    founded: { type: Date, default: null },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
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
