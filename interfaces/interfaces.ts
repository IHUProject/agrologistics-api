export interface ICustomError {
  statusCode: number | string;
  msg: string;
}

interface IMessage {
  message: string;
}

export interface IUpdatedError {
  path: string;
  name: string;
  statusCode: number | string;
  message: string;
  code: string | number;
  value: string;
  keyValue: string;
  errors: IMessage[];
}
