import express from 'express';
import * as dotenv from 'dotenv';
import { connectDB } from './db/connect';
import { InternalServerError } from './errors';
import 'express-async-errors';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { IUserWithID } from './interfaces/interfaces';
import morgan from 'morgan';

//middlewares
import { notFoundMiddleware } from './middlewares/not-found';
import { headersMiddleware } from './middlewares/headers';
import { errorHandlerMiddleware } from './middlewares/error-handler';
import { authenticateUser } from './middlewares/auth-middlewares';

//routes
import authRouter from './routes/auth-routes';
import userRouter from './routes/user-routes';
import companyRouter from './routes/company-routes';
import accountantRouter from './routes/accountant-routes';
import productRouter from './routes/product-routes';
import supplierRouter from './routes/supplier-routes';

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
server.use(cookieParser(process.env.JWT_SECRET));
server.use(cors(corsObject));
server.use(morgan('dev'));

server.use('/api/v1/al/auth', authRouter);
server.use('/api/v1/al/user', authenticateUser, userRouter);
server.use('/api/v1/al/company', authenticateUser, companyRouter);
server.use('/api/v1/al/accountant', authenticateUser, accountantRouter);
server.use('/api/v1/al/supplier', authenticateUser, supplierRouter);
server.use('/api/v1/al/product', authenticateUser, productRouter);

server.use(notFoundMiddleware);
server.use(headersMiddleware);
server.use(errorHandlerMiddleware);

const port = 4500;

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
