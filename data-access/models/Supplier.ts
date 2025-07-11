import mongoose, { Schema } from 'mongoose'
import './Expense'
import { ISupplier } from '../../types/interfaces'
import { validatePhoneNumber } from '../../common/helpers/validate-schema-properties'
import isEmail from 'validator/lib/isEmail'

const supplierSchema = new Schema<ISupplier>(
  {
    firstName: {
      type: String,
      required: [true, 'Please provide a first name for the supplier.'],
      minlength: 3,
      maxlength: 50
    },
    lastName: {
      type: String,
      required: [true, 'Please provide a last name for the supplier.'],
      minlength: 3,
      maxlength: 50
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      minlength: 7,
      maxlength: 35,
      validate: [isEmail, 'Please provide a valid email address.']
    },
    phone: {
      type: Number,
      unique: true,
      sparse: true,
      validate: [
        validatePhoneNumber,
        'Invalid phone number, must be 10 digits.'
      ]
    },
    address: {
      type: String,
      default: null
    },
    expenses: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Expanse' }],
      default: []
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: [true, 'Please provide the creator.'],
      ref: 'User'
    },
    company: {
      type: Schema.Types.ObjectId,
      required: [true, 'Please provide the company.'],
      ref: 'Company'
    }
  },
  { timestamps: true, versionKey: false }
)

const Supplier = mongoose.model<ISupplier>('Supplier', supplierSchema)

export default Supplier
