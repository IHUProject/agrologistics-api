import { Roles } from './enums';
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
  employees: Types.ObjectId[];
  accountant: Types.ObjectId;
  products: Types.ObjectId[];
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
}

export interface IProduct extends Document {
  name: string;
  pricePerKilo: number;
  category: string;
  stockInKilo: number;
  description: string;
  images: string[];
}

export interface IPasswordPayload {
  newPassword: string;
  oldPassword: string;
}

export interface ImgurResponse {
  data: ImgurBodyResponse;
}

export interface IDataImgur {
  link: string;
  deletehash: string;
}

interface ImgurBodyResponse {
  data: IDataImgur;
  success: boolean;
  status: number;
}
