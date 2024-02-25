import { PaymentMethod, PurchaseExpenseStatus, Roles } from './enums';
import { Document, Types } from 'mongoose';

export interface ICustomError {
  statusCode: number | string;
  msg: string;
}

export interface IErrorProperties {
  message: string;
  role: {
    kind: string;
    value: string;
  };
}

export interface IUpdatedError {
  kind: string;
  path: string;
  name: string;
  statusCode: number | string;
  message: string;
  code: string | number;
  value: string;
  keyValue: string;
  errors: IErrorProperties;
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Roles;
  phone: number;
  image: IDataImgur;
  company: Types.ObjectId;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface ICompany extends Document {
  name: string;
  phone: number;
  address: string;
  afm: number;
  logo: IDataImgur;
  founded: Date;
  latitude: number;
  longitude: number;
  owner: Types.ObjectId;
  credentials: Types.ObjectId;
  employees: Types.ObjectId[];
  accountant: Types.ObjectId;
  products: Types.ObjectId[];
  suppliers: Types.ObjectId[];
  purchases: Types.ObjectId[];
  clients: Types.ObjectId[];
  expenses: Types.ObjectId[];
  categories: Types.ObjectId[];
}

export interface IUserWithID extends IUser {
  userId: Types.ObjectId;
}

export interface IAccountant extends Document {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  phone: number;
  latitude?: number;
  longitude?: number;
  createdBy: Types.ObjectId;
}

export interface IProduct extends Document {
  name: string;
  price: string;
  description: string;
  purchases: Types.ObjectId[];
  company: Types.ObjectId;
  createdBy: Types.ObjectId;
}

export interface IPasswordPayload {
  newPassword: string;
  oldPassword: string;
}

export interface ImgurResponse {
  data: ImgurBodyResponse;
}

export interface IDataImgur {
  _id?: string;
  link: string;
  deletehash: string;
}

export interface ISupplier extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: number;
  address: string;
  expenses: Types.ObjectId[];
  createdBy: Types.ObjectId;
  company: Types.ObjectId;
}

export interface IPurchase extends Document {
  totalAmount: number;
  status: PurchaseExpenseStatus;
  paymentMethod: PaymentMethod;
  date: Date;
  isSend: boolean;
  description: string;
  client: Types.ObjectId;
  products: Types.ObjectId[];
  createdBy: Types.ObjectId;
  company: Types.ObjectId;
}

export interface IClient extends Document {
  firstName: string;
  lastName: string;
  address: string;
  phone: number;
  purchases: Types.ObjectId[];
  createdBy: Types.ObjectId;
  company: Types.ObjectId;
}

export interface IExpense extends Document {
  date: Date;
  images: IDataImgur[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  description: string;
  isSend: boolean;
  status: PurchaseExpenseStatus;
  category: Types.ObjectId;
  supplier: Types.ObjectId;
  createdBy: Types.ObjectId;
  company: Types.ObjectId;
}

export interface ICategory extends Document {
  name: string;
  expenses: Types.ObjectId[];
  company: Types.ObjectId;
  createdBy: Types.ObjectId;
}

export interface ICredential extends Document {
  email: string;
  pass: string;
  company: Types.ObjectId;
  createdBy: Types.ObjectId;
}

export interface IPopulate {
  path: string;
  select: string;
  options?: {
    limit?: number;
    strictPopulate?: boolean;
  };
  populate?: IPopulate[];
}

interface ImgurBodyResponse {
  data: IDataImgur;
  success: boolean;
  status: number;
}
