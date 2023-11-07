import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class CheckIsAdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    if (!('user' in request)) {
      throw new UnauthorizedException();
    }

    console.log(request['user']);

    const payload = request['user'];
    const roles = payload?.['realm_access']?.['roles'] || [];
    console.log(roles);
    if (roles.indexOf('admin-catalog') === -1) {
      throw new ForbiddenException();
    }

    return true;
  }
}
