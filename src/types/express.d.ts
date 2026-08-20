import { Request } from 'express';

export interface UserPayload {
  userInfo: {
    username: string;
    [key: string]: unknown;
  };
}

export interface AuthenticatedRequest extends Request {
  user: UserPayload;
}
