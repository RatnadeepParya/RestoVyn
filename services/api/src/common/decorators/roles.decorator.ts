import { SetMetadata } from "@nestjs/common";
import { StaffRole } from "@restovyn/types";

export const ROLES_KEY = "roles";
export const Roles = (...roles: StaffRole[]) => SetMetadata(ROLES_KEY, roles);

export const PERMISSIONS_KEY = "permissions";
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
