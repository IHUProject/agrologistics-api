import mongoose, { Schema } from 'mongoose';
import { IProduct } from '../interfaces/interfaces';

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name for the product.'],
      minlength: 3,
      maxlength: 50,
    },
    price: {
      type: String,
      required: [true, 'Please provide a price'],
    },
    description: { type: String, default: null },
  },
  { timestamps: true, versionKey: false }
);

const Product = mongoose.model<IProduct>('Product', productSchema, 'Products');

export default Product;
