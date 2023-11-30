import mongoose, { Schema } from 'mongoose';
import { ICompany } from '../interfaces/interfaces';

const companySchema: mongoose.Schema<ICompany> = new Schema<ICompany>(
  {
    name: { type: String, required: [true, 'Name is required'] },
    phone: { type: Number },
    address: { type: String },
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    afm: { type: Number, required: [true, 'AFM is required'] },
    logo: String,
    since: { type: Date },
    latitude: String,
    longitude: String,
    employees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    clients: String,
    revenues: String,
    expenses: String,
    accountants: String,
    products: String,
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
