import {CanActivate, ExecutionContext, ForbiddenException, Injectable} from "@nestjs/common";

@Injectable()
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