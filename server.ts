import express from 'express'
import * as dotenv from 'dotenv'

import 'express-async-errors'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import morgan from 'morgan'

import { Roles } from './types/enums'
import { IUserWithID } from './types/interfaces'
import { InternalServerError } from './common/errors'
import { connectDB } from './data-access/db/connect'

//middlewares
import { notFoundMiddleware } from './presentaition/middlewares/not-found'
import { headersMiddleware } from './presentaition/middlewares/headers'
import { errorHandlerMiddleware } from './presentaition/middlewares/error-handler'
import {
  authenticateUser,
  authorizePermissions
} from './presentaition/middlewares/auth-middlewares'
import { hasEmail } from './presentaition/middlewares/is-accountant-have-email'
import { hasCreds } from './presentaition/middlewares/has-credentials'

//routes
import authRouter from './presentaition/routes/auth-routes'
import userRouter from './presentaition/routes/user-routes'
import companyRouter from './presentaition/routes/company-routes'
import accountantRouter from './presentaition/routes/accountant-routes'
import productRouter from './presentaition/routes/product-routes'
import supplierRouter from './presentaition/routes/supplier-routes'
import clientRouter from './presentaition/routes/client-routes'
import purchaseRouter from './presentaition/routes/purchase-routes'
import categoryRouter from './presentaition/routes/category-routes'
import expenseRouter from './presentaition/routes/expense-routes'
import sendEmailRouter from './presentaition/routes/email-sender-routes'
import credRouter from './presentaition/routes/credentail-routes'

const server = express()
const corsObject = {
  origin: true,
  credentials: true
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      currentUser: IUserWithID
    }
  }
}

dotenv.config()

server.use(express.json())
server.use(express.urlencoded({ extended: true }))
server.use(cookieParser(process.env.JWT_SECRET))
server.use(cors(corsObject))
server.use(morgan('dev'))

server.use('/api/v1/al/auth', authRouter)
server.use('/api/v1/al/user', userRouter)
server.use('/api/v1/al/company', authenticateUser, companyRouter)
server.use('/api/v1/al/accountant', authenticateUser, accountantRouter)
server.use('/api/v1/al/supplier', authenticateUser, supplierRouter)
server.use('/api/v1/al/product', authenticateUser, productRouter)
server.use('/api/v1/al/client', authenticateUser, clientRouter)
server.use(
  '/api/v1/al/purchase',
  authenticateUser,
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER, Roles.EMPLOY),
  purchaseRouter
)
server.use(
  '/api/v1/al/category',
  authenticateUser,
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER, Roles.EMPLOY),
  categoryRouter
)
server.use(
  '/api/v1/al/expense',
  authenticateUser,
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER, Roles.EMPLOY),
  expenseRouter
)
server.use(
  '/api/v1/al/send-email',
  hasCreds,
  hasEmail,
  authenticateUser,
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER),
  sendEmailRouter
)
server.use(
  '/api/v1/al/credentials',
  authenticateUser,
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER),
  credRouter
)

server.use(notFoundMiddleware)
server.use(headersMiddleware)
server.use(errorHandlerMiddleware)

const port = process.env.PORT || 4500

const startServer = async () => {
  try {
    if (process.env.MONGO_URI) {
      await connectDB(process.env.MONGO_URI)
      server.listen(port, () => {
        console.log(`Server listening at PORT ${port}...`)
      })
    } else {
      throw new InternalServerError(
        'Something went wrong with the database connection.'
      )
    }
  } catch (error) {
    console.log(error)
  }
}

startServer()
