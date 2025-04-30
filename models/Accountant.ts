import mongoose, { Schema } from 'mongoose'
import { IAccountant } from '../interfaces/interfaces'
import validator from 'validator'
import {
  validateLatitude,
  validateLongitude,
  validatePhoneNumber
} from '../helpers/validate-schema-properties'

const accountantSchema = new Schema<IAccountant>(
  {
    firstName: { type: String, default: null, minlength: 3, maxlength: 35 },
    lastName: { type: String, default: null, minlength: 3, maxlength: 35 },
    phone: {
      type: Number,
      default: null,
      validate: [validatePhoneNumber, 'Invalid phone number, must be 10 digits.']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email.'],
      minlength: 7,
      maxlength: 35,
      validate: [validator.isEmail, 'Please provide a valid email address.']
    },
    address: { type: String, default: null, minlength: 5, maxlength: 35 },
    latitude: {
      type: Number,
      default: null,
      validate: {
        validator: validateLatitude,
        message: props =>
          `${props.value} is not a valid latitude, latitude must be a number between -90 and 90.`
      }
    },
    longitude: {
      type: Number,
      default: null,
      validate: {
        validator: validateLongitude,
        message: props =>
          `${props.value} is not a valid longitude, longitude must be a number between -180 and 180.`
      }
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: [true, 'Please provide the creator.'],
      ref: 'User'
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

const Accountant = mongoose.model<IAccountant>('Accountant', accountantSchema)

export default Accountant
