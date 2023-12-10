import { IUser, IUserWithID } from '../interfaces/interfaces';

export const createTokenUser = (user: IUser) =>
  ({
    userId: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    image: user.image,
    email: user.email,
    role: user.role,
    company: user.company,
    phone: user.phone,
  } as IUserWithID);
