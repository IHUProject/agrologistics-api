import { Model } from 'mongoose';
import { ForbiddenError } from '../errors/forbidden';

export const checkIsFirstDocument = async <T>(model: Model<T>) => {
  const count = await model.countDocuments({});
  if (count !== 0) {
    throw new ForbiddenError('An instance of this entity already exists!');
  }
};
