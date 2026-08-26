import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { isUUID } from "class-validator";

export const OptionalActiveAssociationForAdmin = () =>
  SetMetadata("activeAssociationOptionalForAdmin", true);

@Injectable()
export class ActiveAssociationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const optionalForAdmin = this.reflector.get<boolean>(
      "activeAssociationOptionalForAdmin",
      context.getHandler(),
    );

    if (!user) {
      throw new UnauthorizedException("User must be authenticated.");
    }

    const activeAssociationHeader = request.headers["x-active-association"];

    if (!activeAssociationHeader) {
      if (optionalForAdmin && user.isAdmin) {
        return true;
      } else {
        throw new BadRequestException("Active Association header is required.");
      }
    }

    const activeAssociationId = Array.isArray(activeAssociationHeader)
      ? activeAssociationHeader[0]
      : activeAssociationHeader;

    if (
      !activeAssociationId ||
      typeof activeAssociationId !== "string" ||
      !isUUID(activeAssociationId)
    ) {
      throw new BadRequestException(
        "Active Association header must be a valid UUID.",
      );
    }

    if (user.isAdmin) {
      request.activeAssociationId = activeAssociationId;
      return true;
    }

    const hasAssociation = user.associations?.some(
      (association: { id: string }) => association.id === activeAssociationId,
    );

    if (!hasAssociation) {
      throw new ForbiddenException(
        `User does not have access to association with UUID ${activeAssociationId}.`,
      );
    }

    request.activeAssociationId = activeAssociationId;
    return true;
  }
}
