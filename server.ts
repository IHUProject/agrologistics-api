import express from 'express';
import * as dotenv from 'dotenv';

import 'express-async-errors';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';

import { Roles } from './interfaces/enums';
import { IUserWithID } from './interfaces/interfaces';
import { InternalServerError } from './errors';
import { connectDB } from './db/connect';

//middlewares
import { notFoundMiddleware } from './middlewares/not-found';
import { headersMiddleware } from './middlewares/headers';
import { errorHandlerMiddleware } from './middlewares/error-handler';
import {
  authenticateUser,
  authorizePermissions,
} from './middlewares/auth-middlewares';

//routes
import authRouter from './routes/auth-routes';
import userRouter from './routes/user-routes';
import companyRouter from './routes/company-routes';
import accountantRouter from './routes/accountant-routes';
import productRouter from './routes/product-routes';
import supplierRouter from './routes/supplier-routes';
import clientRouter from './routes/client-routes';
import purchaseRouter from './routes/purchase-routes';
import categoryRouter from './routes/category-routes';
import expenseRouter from './routes/expense-routes';

const server = express();
const corsObject = {
  origin: true,
  credentials: true,
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      currentUser?: IUserWithID;
    }
  }
}

dotenv.config();

server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(cookieParser(process.env.JWT_SECRET));
server.use(cors(corsObject));
server.use(morgan('dev'));

server.use(`${process.env.BASE_URL}/auth`, authRouter);
server.use(`${process.env.BASE_URL}/user`, authenticateUser, userRouter);
server.use(`${process.env.BASE_URL}/company`, authenticateUser, companyRouter);
server.use(
  `${process.env.BASE_URL}/accountant`,
  authenticateUser,
  accountantRouter
);
server.use(
  `${process.env.BASE_URL}/supplier`,
  authenticateUser,
  supplierRouter
);
server.use(`${process.env.BASE_URL}/product`, authenticateUser, productRouter);
server.use(`${process.env.BASE_URL}/client`, authenticateUser, clientRouter);
server.use(
  `${process.env.BASE_URL}/purchase`,
  authenticateUser,
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER, Roles.EMPLOY),
  purchaseRouter
);
server.use(
  `${process.env.BASE_URL}/category`,
  authenticateUser,
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER, Roles.EMPLOY),
  categoryRouter
);
server.use(
  `${process.env.BASE_URL}/expense`,
  authenticateUser,
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER, Roles.EMPLOY),
  expenseRouter
);

server.use(notFoundMiddleware);
server.use(headersMiddleware);
server.use(errorHandlerMiddleware);

const port = process.env.PORT || 4500;

const startServer = async () => {
  try {
    if (process.env.MONGO_URI) {
      await connectDB(process.env.MONGO_URI);
      server.listen(port, () => {
        console.log(`Server listening at PORT ${port}...`);
      });
    } else {
      throw new InternalServerError(
        'Something went wrong with the database connection.'
      );
    }
  } catch (error) {
    console.log(error);
  }
};

startServer();
