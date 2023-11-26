import { Request } from 'express';

export class UserService {
  private req: Request;

  constructor(req: Request) {
    this.req = req;
  }

  getCurrentUser() {
    return this.req.currentUser;
  }
}
