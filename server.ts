import express from 'express';
import * as dotenv from 'dotenv';
import { connectDB } from './db/connect';
import { InternalServerError } from './errors';

//middlewares
import { notFoundMiddleware } from './middlewares/not-found';
import { headersMiddleware } from './middlewares/headers';
import { errorHandlerMiddleware } from './middlewares/error-handler';

const server: express.Application = express();

dotenv.config();

server.use(notFoundMiddleware);
server.use(headersMiddleware);
server.use(errorHandlerMiddleware);

const port: number = Number(process.env.PORT) || 4000;

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
