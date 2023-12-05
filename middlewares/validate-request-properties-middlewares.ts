import { NextFunction, Request, Response } from 'express';
import { BadRequestError } from '../errors';
import { Roles } from '../interfaces/enums';
import validator from 'validator';

export const checkCoordinates = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { latitude, longitude } = req.body;
  if (latitude && !longitude) {
    throw new BadRequestError('Add longitude!');
  }

  if (!latitude && longitude) {
    throw new BadRequestError('Add latitude!');
  }

  if (latitude && isNaN(latitude)) {
    throw new BadRequestError('Latitude is not a number!');
  }

  if (longitude && isNaN(longitude)) {
    throw new BadRequestError('Longitude is not a number!');
  }

  next();
};

export const checkPageQuery = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { page } = req.query;
  if (page && isNaN(Number(page))) {
    throw new BadRequestError('Page number must be a valid number');
  }

  const pageNumber = Number(page) || 1;

  if (!Number.isSafeInteger(pageNumber) || pageNumber < 1) {
    throw new BadRequestError('Page number must be a positive safe integer');
  }

  next();
};

export const validateRoleProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { role } = req.body;
  if (role) {
    if (role === Roles.OWNER || !Object.values(Roles).includes(role)) {
      throw new BadRequestError('Invalid role provided!');
    }
  }
  next();
};

export const validateUserPayload = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { firstName, lastName, email } = req.body;

  const isFirstNameInvalid =
    !firstName || firstName.length < 3 || firstName.length > 50;
  const isLastNameInvalid =
    !lastName || lastName.length < 3 || lastName.length > 50;
  const isEmailInvalid =
    !email ||
    email.length < 7 ||
    email.length > 35 ||
    !validator.isEmail(email);

  if (isFirstNameInvalid) {
    throw new BadRequestError('First name value is invalid');
  }
  if (isLastNameInvalid) {
    throw new BadRequestError('Last name value is invalid');
  }

  if (isEmailInvalid) {
    throw new BadRequestError('Email value is invalid');
  }

  next();
};

export const validatePassword = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { password } = req.body;
  const isPasswordInvalid = !password || password.length < 5;

  if (isPasswordInvalid) {
    throw new BadRequestError('Password value is invalid');
  }

  next();
};
