import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { Roles } from '../interfaces/enums';
import { IUser } from '../interfaces/interfaces';

const userSchema: mongoose.Schema<IUser> = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required.'],
      minlength: 2,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required.'],
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      unique: true,
      required: [true, 'E-mail is required.'],
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
      minlength: 5,
    },
    image: {
      type: String,
      required: [true, 'Image is required.'],
    },
    role: {
      type: String,
      enum: Object.values(Roles),
      default: Roles.UNCATEGORIZED,
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

const User: mongoose.Model<IUser> = mongoose.model<IUser>(
  'User',
  userSchema,
  'Users'
);

export default User;
