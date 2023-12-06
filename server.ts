import express from 'express';
import * as dotenv from 'dotenv';
import { connectDB } from './db/connect';
import { InternalServerError } from './errors';
import 'express-async-errors';
import cookieParser from 'cookie-parser';
import { v2 as cloudinary } from 'cloudinary';
import fileUpload from 'express-fileupload';
import cors from 'cors';

//middlewares
import { notFoundMiddleware } from './middlewares/not-found';
import { headersMiddleware } from './middlewares/headers';
import { errorHandlerMiddleware } from './middlewares/error-handler';

//routes
import authRouter from './routes/auth-routes';
import userRouter from './routes/user-routes';
import companyRouter from './routes/company-routes';
import { IUserWithID } from './interfaces/interfaces';
import { validateFiles } from './middlewares/validate-request-properties-middlewares';

const server = express();

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      currentUser?: IUserWithID;
    }
  }
}

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

server.use(express.json());
server.use(cookieParser(process.env.JWT_SECRET));
server.use(
  cors({
    origin: true,
    credentials: true,
  })
);
server.use(
  fileUpload({
    useTempFiles: true,
    limits: { fileSize: 50 * 1024 * 1024 },
  })
);
server.use(validateFiles);

server.use('/api/v1/al/auth', authRouter);
server.use('/api/v1/al/user', userRouter);
server.use('/api/v1/al/company', companyRouter);

server.use(notFoundMiddleware);
server.use(headersMiddleware);
server.use(errorHandlerMiddleware);

const port = Number(process.env.PORT) || 4500;

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
