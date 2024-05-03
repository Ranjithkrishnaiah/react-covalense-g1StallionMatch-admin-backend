import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleService } from './role.service';

@Injectable()
export class RoleGuard implements CanActivate {
  public permissions;
  constructor(public roleService: RoleService, public reflector: Reflector) {}
  async canActivate(context: ExecutionContext): Promise<any> {
    let allow = true;
    let accessData = null;
    try {
      const request = context.switchToHttp().getRequest();
      const apiDetails = this.reflector.get<any>('api', context.getHandler());
      if (
        !Array.isArray(apiDetails.permissions) ||
        apiDetails.permissions.length === 0
      ) {
        throw new ForbiddenException('You do not have sufficient privileges');
      }
      this.permissions = apiDetails.permissions;
      let rules: any = await this.roleService.findScopes(
        request.user.id,
        this.permissions,
      );
      if (rules === null || rules.length === 0) {
        throw new ForbiddenException('You do not have sufficient privileges');
      }
    } catch (error) {
      allow = false;
      throw error;
    }
    return allow;
  }
}
