import mongoose, { Schema } from 'mongoose';
import { ICredential } from '../interfaces/interfaces';
import { validateGmail } from '../helpers/validate-schema-properties';

const credentialSchema = new Schema<ICredential>(
  {
    email: {
      type: String,
      unique: true,
      required: [true, 'Please provide an email.'],
      minlength: 7,
      maxlength: 35,
      validate: {
        validator: validateGmail,
        message: (props) =>
          `${props.value} is not a valid Google email address.`,
      },
    },
    pass: {
      type: String,
      required: [true, 'Provide last  name name for the client.'],
      minlength: 3,
      maxlength: 50,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: [true, 'Please provide the creator.'],
      ref: 'User',
    },
    company: {
      type: Schema.Types.ObjectId,
      required: [true, 'Please provide the company.'],
      ref: 'Company',
    },
  },
  { timestamps: true, versionKey: false }
);

const Credential = mongoose.model<ICredential>('Credential', credentialSchema);

export default Credential;
