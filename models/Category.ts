import mongoose, { Schema } from 'mongoose'
import './Expense'
import { ICategory } from '../interfaces/interfaces'

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name for the category.']
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
    },
    expenses: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Expanse' }],
      default: []
    }
  },
  { timestamps: true, versionKey: false }
)

const Category = mongoose.model<ICategory>('Category', categorySchema)

export default Category
