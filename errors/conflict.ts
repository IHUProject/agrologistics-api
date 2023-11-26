import { StatusCodes } from 'http-status-codes';
import { CustomAPIError } from './custom-api-error';

export class ConflictError extends CustomAPIError {
  statusCode: StatusCodes;
  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.CONFLICT;
  }
}
