import mongoose from 'mongoose';
import { Roles } from './enums';

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

export interface IUser extends mongoose.Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  image: string;
  role: Roles;
  phone: number;
  company: mongoose.Types.ObjectId;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface ICompany extends mongoose.Document {
  name: string;
  phone: number;
  address: string;
  owner: mongoose.Types.ObjectId;
  afm: number;
  logo: string;
  founded: Date;
  latitude: number;
  longitude: number;
}

export interface IUserWithID extends IUser {
  userId: mongoose.Types.ObjectId;
}

export interface IAccountant extends mongoose.Document {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  phone: number;
  latitude?: number;
  longitude?: number;
  company: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
}

export interface IProduct extends mongoose.Document {
  name: string;
  pricePerKilo: number;
  category: string;
  stockInKilo: number;
  description: string;
  images: string[];
  company: mongoose.Types.ObjectId;
}

export interface IPayload<T> {
  postmanRequest: boolean;
  data: T;
}

export interface IPasswordPayload {
  newPassword: string;
  oldPassword: string;
}
