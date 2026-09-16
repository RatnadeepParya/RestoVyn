import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY, PERMISSIONS_KEY } from "../decorators/roles.decorator";
import { StaffRole } from "@restovyn/types";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<StaffRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.role) {
      throw new ForbiddenException("Access denied: User has no assigned role");
    }

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied: Required role [${requiredRoles.join(", ")}], current role [${user.role}]`,
      );
    }

    return true;
  }
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !Array.isArray(user.permissions)) {
      throw new ForbiddenException(
        "Access denied: User permissions unavailable",
      );
    }

    const hasAllPermissions = requiredPermissions.every((perm) =>
      user.permissions.includes(perm),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        `Access denied: Missing required permission [${requiredPermissions.join(", ")}]`,
      );
    }

    return true;
  }
}
