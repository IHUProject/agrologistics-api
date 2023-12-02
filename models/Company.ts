import mongoose, { Schema } from 'mongoose';
import { ICompany } from '../interfaces/interfaces';

const companySchema: mongoose.Schema<ICompany> = new Schema<ICompany>(
  {
    name: { type: String, required: true },
    phone: { type: Number, unique: true },
    address: { type: String },
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    afm: { type: Number, unique: true, required: true },
    logo: String,
    since: { type: Date },
    latitude: Number,
    longitude: Number,
    employees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
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
