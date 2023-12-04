import { IUserWithID } from './src/interfaces/interfaces';

declare global {
  namespace Express {
    interface Request {
      currentUser: IUserWithID;
    }
  }
}
