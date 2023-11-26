import mongoose from 'mongoose';
import { Roles } from './enums';
import { Request } from 'express';

export interface ICustomError {
  statusCode: number | string;
  msg: string;
}

export interface IMessage {
  message: string;
}

export interface IUpdatedError {
  path: string;
  name: string;
  statusCode: number | string;
  message: string;
  code: string | number;
  value: string;
  keyValue: string;
  errors: IMessage[];
}

export interface IUser extends mongoose.Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  image: string;
  role: Roles;
  createdAt?: Date;
  updatedAt?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserWithID extends IUser {
  userId: string;
}

export interface IPayloadUserData {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Roles;
  image: string;
}

export interface RequestWithAuth extends Request {
  currentUser: IPayloadUserData;
}
