import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { DefaultImage, Roles } from '../interfaces/enums';
import { IUser } from '../interfaces/interfaces';
import validator from 'validator';
import { validatePhoneNumber } from '../helpers/validate-schema-properties';

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, 'Please provide first name.'],
      minlength: 3,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: [true, 'Please provide last name.'],
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      unique: true,
      required: [true, 'Please provide an email.'],
      minlength: 7,
      maxlength: 35,
      validate: [validator.isEmail, 'Please provide a valid email address.'],
    },
    password: {
      type: String,
      required: [true, 'Please provide password.'],
      minlength: 5,
    },
    image: {
      link: { type: String, default: DefaultImage.PROFILE_IMAGE },
      deletehash: { type: String, default: '' },
    },
    role: {
      type: String,
      enum: {
        values: Object.values(Roles),
        message: '{VALUE} is not valid role.',
      },
      default: Roles.UNCATEGORIZED,
    },
    phone: {
      type: Number,
      unique: true,
      sparse: true,
      validate: [
        validatePhoneNumber,
        'Invalid phone number, must be 10 digits.',
      ],
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      default: null,
    },
  },
  { timestamps: true, versionKey: false }
);

userSchema.pre<IUser>('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt: string = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;
