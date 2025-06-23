import mongoose, { Schema } from 'mongoose'
import { validateDate } from '../../common/helpers/validate-schema-properties'
import { PaymentMethod, PurchaseExpenseStatus } from '../../types/enums'
import { IPurchase } from '../../types/interfaces'

const purchaseSchema = new Schema<IPurchase>(
  {
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0.01, 'Total amount must be at least 0.01']
    },
    status: {
      type: String,
      enum: {
        values: Object.values(PurchaseExpenseStatus),
        message: '{VALUE} is not a valid status'
      },
      default: PurchaseExpenseStatus.PENDING
    },
    paymentMethod: {
      type: String,
      enum: {
        values: Object.values(PaymentMethod),
        message: '{VALUE} is not a valid payment method'
      },
      default: PaymentMethod.OTHER
    },
    date: {
      type: Date,
      default: null,
      validate: {
        validator: validateDate,
        message: props =>
          `${props.value} is not a valid date, please use the format YYYY/MM/DD.`
      }
    },
    client: {
      type: Schema.Types.ObjectId,
      required: [true, 'Client is required.'],
      ref: 'Client'
    },
    description: {
      type: String,
      default: null
    },
    isSend: {
      type: Boolean,
      default: false
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'At least one product is required.']
      }
    ],
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
  {
    timestamps: true,
    versionKey: false
  }
)

const Purchase = mongoose.model<IPurchase>('Purchase', purchaseSchema)

export default Purchase
