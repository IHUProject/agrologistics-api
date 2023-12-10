import mongoose, { Schema } from 'mongoose';
import { IProduct } from '../interfaces/interfaces';
import { DefaultImage } from '../interfaces/enums';

const productSchema: mongoose.Schema<IProduct> = new Schema<IProduct>(
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
    images: {
      type: [String],
      default: [DefaultImage.PRODUCT],
    },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    versionKey: false,
  }
);

const Product: mongoose.Model<IProduct> = mongoose.model<IProduct>(
  'Product',
  productSchema,
  'Products'
);

export default Product;
