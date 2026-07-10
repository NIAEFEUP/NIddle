import {CanActivate, ExecutionContext, ForbiddenException} from "@nestjs/common";

export class AdminOnlyGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user || user.isAdmin) {
            throw new ForbiddenException("Only administrators can perform this action.");
        }
        return true;
    }
}