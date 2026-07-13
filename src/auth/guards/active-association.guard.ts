import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";

@Injectable()
export class ActiveAssociationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException("User must be authenticated.");
    }

    const activeAssociationHeader = request.headers["x-active-association"];

    if (!activeAssociationHeader) {
      throw new ForbiddenException("Active Association header is required.");
    }

    const activeAssociationId = parseInt(activeAssociationHeader as string, 10);

    if (Number.isNaN(activeAssociationId)) {
      throw new BadRequestException(
        "Active Association header must be a valid integer.",
      );
    }

    if (user.isAdmin) {
      request.activeAssociationId = activeAssociationId;
      return true;
    }

    const hasAssociation = user.associations?.some(
      (association: { id: number }) => association.id === activeAssociationId,
    );

    if (!hasAssociation) {
      throw new ForbiddenException(
        `User does not have access to association with ID ${activeAssociationId}.`,
      );
    }

    request.activeAssociationId = activeAssociationId;
    return true;
  }
}
