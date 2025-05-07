import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorator/roles.decorator';
import { Role } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );
        if (!requiredRoles) {
            return true; // If no roles are required, allow access
        }
        const { user } = context.switchToHttp().getRequest();
        // Assuming the user object has a 'roles' property which is an array of strings (or Role enums)
        // This property should be set by your authentication guard (e.g., JwtAuthGuard)
        if (!user || !user.roles) {
            return false; // If user or user.roles is not defined, deny access
        }
        return requiredRoles.some((role) => user.roles.includes(role));
    }
}
