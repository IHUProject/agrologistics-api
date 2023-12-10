import mongoose from 'mongoose';
import { Roles } from './enums';

export interface ICustomError {
  statusCode: number | string;
  msg: string;
}

export interface RequestBody<T> {
  body: T;
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
  company: mongoose.Types.ObjectId;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface ICompany extends mongoose.Document {
  name: string;
  phone: string;
  address: string;
  owner: mongoose.Types.ObjectId;
  afm: string;
  logo: string;
  founded: string;
  latitude?: number;
  longitude?: number;
}

export interface IUserWithID extends IUser {
  userId: mongoose.Types.ObjectId;
}

export interface IAccountant {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  phone: string;
  latitude?: string;
  longitude?: string;
  company: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
}
