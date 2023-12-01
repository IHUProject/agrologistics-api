import { BadRequestError } from '../errors';

export const checkCoordinates = (lat: string, long: string) => {
  if (lat && !long) {
    throw new BadRequestError('Add longitude!');
  }

  if (!lat && long) {
    throw new BadRequestError('Add latitude!');
  }

  return true;
};
