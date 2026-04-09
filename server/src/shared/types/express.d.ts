import { SafeUser } from '@/v1/modules/users/types/user.types';

declare global {
  namespace Express {
    interface User extends SafeUser {}

    interface Request {
      user?: SafeUser;
    }
  }
}
