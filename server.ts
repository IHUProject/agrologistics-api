import express from 'express';
import * as dotenv from 'dotenv';
import { connectDB } from './db/connect';
import { InternalServerError } from './errors';
import 'express-async-errors';
import cookieParser from 'cookie-parser';

//middlewares
import { notFoundMiddleware } from './middlewares/not-found';
import { headersMiddleware } from './middlewares/headers';
import { errorHandlerMiddleware } from './middlewares/error-handler';

//routes
import authRouter from './routes/auth-routes';

const server: express.Application = express();

dotenv.config();

server.use(express.json());
server.use(cookieParser(process.env.JWT_SECRET));

server.use('/api/v1/al/auth', authRouter);

server.use(notFoundMiddleware);
server.use(headersMiddleware);
server.use(errorHandlerMiddleware);

const port: number = Number(process.env.PORT) || 4500;

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
