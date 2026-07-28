import { BadRequestException, ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { ActiveAssociationGuard } from "./active-association.guard";

describe("ActiveAssociationGuard", () => {
  let guard: ActiveAssociationGuard;

  beforeEach(() => {
    guard = new ActiveAssociationGuard();
  });

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  it("should throw UnauthorizedException if user is not present", () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { "x-active-association": "1" },
        }),
      }),
    } as any;

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it("should throw BadRequestException if x-active-association header is missing", () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 1 },
          headers: {},
        }),
      }),
    } as any;

    expect(() => guard.canActivate(context)).toThrow(BadRequestException);
  });

  it("should throw BadRequestException if x-active-association is not a valid integer", () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 1 },
          headers: { "x-active-association": "abc" },
        }),
      }),
    } as any;

    expect(() => guard.canActivate(context)).toThrow(BadRequestException);
  });

  it("should return true and set activeAssociationId if user is admin", () => {
    const request: any = {
      user: { id: 1, isAdmin: true },
      headers: { "x-active-association": "5" },
    };
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as any;

    const result = guard.canActivate(context);

    expect(result).toBe(true);
    expect(request.activeAssociationId).toBe(5);
  });

  it("should return true if user has the association", () => {
    const request: any = {
      user: {
        id: 1,
        isAdmin: false,
        associations: [{ id: 3 }, { id: 5 }],
      },
      headers: { "x-active-association": "5" },
    };
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as any;

    const result = guard.canActivate(context);

    expect(result).toBe(true);
    expect(request.activeAssociationId).toBe(5);
  });

  it("should throw ForbiddenException if user does not have the association", () => {
    const request = {
      user: {
        id: 1,
        isAdmin: false,
        associations: [{ id: 3 }],
      },
      headers: { "x-active-association": "5" },
    };
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as any;

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it("should throw ForbiddenException if user has no associations", () => {
    const request = {
      user: {
        id: 1,
        isAdmin: false,
        associations: [],
      },
      headers: { "x-active-association": "5" },
    };
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as any;

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it("should throw ForbiddenException if user associations is undefined", () => {
    const request = {
      user: {
        id: 1,
        isAdmin: false,
      },
      headers: { "x-active-association": "5" },
    };
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as any;

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
