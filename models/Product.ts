import mongoose, { Schema, Types } from 'mongoose'
import { IProduct } from '../interfaces/interfaces'

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name for the product.'],
      minlength: 3,
      maxlength: 50
    },
    price: {
      type: String,
      required: [true, 'Please provide a price']
    },
    description: { type: String, default: null },
    purchases: [
      {
        type: Types.ObjectId,
        ref: 'Purchase'
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
  { timestamps: true, versionKey: false }
)

const Product = mongoose.model<IProduct>('Product', productSchema)

export default Product
