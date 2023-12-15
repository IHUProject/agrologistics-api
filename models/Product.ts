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
    pricePerKilo: {
      type: Number,
      required: [true, 'Please provide a price per kilogram.'],
      min: 0.01,
    },
    stockInKilo: { type: Number, default: 0, min: 0 },
    description: { type: String, default: null },
  },
  { timestamps: true, versionKey: false }
);

const Product = mongoose.model<IProduct>('Product', productSchema, 'Products');

export default Product;
