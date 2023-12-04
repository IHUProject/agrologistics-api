import mongoose, { Schema } from 'mongoose';
import { ICompany } from '../interfaces/interfaces';

const companySchema: mongoose.Schema<ICompany> = new Schema<ICompany>(
  {
    name: { type: String, required: true },
    phone: { type: Number, unique: true },
    address: String,
    owner: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    afm: { type: Number, unique: true, required: true },
    logo: String,
    founded: Date,
    latitude: Number,
    longitude: Number,
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
