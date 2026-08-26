import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ActiveAssociationGuard } from "./active-association.guard";

describe("ActiveAssociationGuard", () => {
  let guard: ActiveAssociationGuard;
  const mockReflector = { get: jest.fn() };

  const buildContext = (request: any) =>
    ({
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => jest.fn(),
    }) as any;

  beforeEach(() => {
    guard = new ActiveAssociationGuard(mockReflector as unknown as Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  const validUuid1 = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";
  const validUuid2 = "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33";
  const validUuid3 = "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44";

  it("should throw UnauthorizedException if user is not present", () => {
    const context = buildContext({
      headers: { "x-active-association": validUuid1 },
    });

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it("should throw BadRequestException if x-active-association header is missing", () => {
    const context = buildContext({
      user: { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" },
      headers: {},
    });

    expect(() => guard.canActivate(context)).toThrow(BadRequestException);
  });

  it("should throw BadRequestException if x-active-association is not a valid UUID", () => {
    const context = buildContext({
      user: { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" },
      headers: { "x-active-association": "not-a-uuid" },
    });

    expect(() => guard.canActivate(context)).toThrow(BadRequestException);
  });

  it("should return true and set activeAssociationId if user is admin", () => {
    const request: any = {
      user: { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", isAdmin: true },
      headers: { "x-active-association": validUuid1 },
    };
    const context = buildContext(request);

    const result = guard.canActivate(context);

    expect(result).toBe(true);
    expect(request.activeAssociationId).toBe(validUuid1);
  });

  it("should return true if user has the association", () => {
    const request: any = {
      user: {
        id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        isAdmin: false,
        associations: [{ id: validUuid2 }, { id: validUuid1 }],
      },
      headers: { "x-active-association": validUuid1 },
    };
    const context = buildContext(request);

    const result = guard.canActivate(context);

    expect(result).toBe(true);
    expect(request.activeAssociationId).toBe(validUuid1);
  });

  it("should throw ForbiddenException if user does not have the association", () => {
    const request = {
      user: {
        id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        isAdmin: false,
        associations: [{ id: validUuid2 }],
      },
      headers: { "x-active-association": validUuid1 },
    };
    const context = buildContext(request);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it("should throw ForbiddenException if user has no associations", () => {
    const request = {
      user: {
        id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        isAdmin: false,
        associations: [],
      },
      headers: { "x-active-association": validUuid1 },
    };
    const context = buildContext(request);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it("should throw ForbiddenException if user associations is undefined", () => {
    const request = {
      user: {
        id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        isAdmin: false,
      },
      headers: { "x-active-association": validUuid1 },
    };
    const context = buildContext(request);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  describe("when the route is marked optional for admin", () => {
    beforeEach(() => {
      mockReflector.get.mockReturnValue(true);
    });

    it("returns true and does not set activeAssociationId when an admin omits the header", () => {
      const request: any = {
        user: { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", isAdmin: true },
        headers: {},
      };
      const context = buildContext(request);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(request.activeAssociationId).toBeUndefined();
    });

    it("still throws BadRequestException when a non-admin omits the header", () => {
      const request = {
        user: {
          id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
          isAdmin: false,
          associations: [],
        },
        headers: {},
      };
      const context = buildContext(request);

      expect(() => guard.canActivate(context)).toThrow(BadRequestException);
    });

    it("still validates and scopes the association when an admin provides the header", () => {
      const request: any = {
        user: { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", isAdmin: true },
        headers: { "x-active-association": validUuid3 },
      };
      const context = buildContext(request);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(request.activeAssociationId).toBe(validUuid3);
    });
  });

  describe("when the route is not marked optional for admin", () => {
    it("still throws BadRequestException when an admin omits the header", () => {
      mockReflector.get.mockReturnValue(undefined);

      const request = {
        user: { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", isAdmin: true },
        headers: {},
      };
      const context = buildContext(request);

      expect(() => guard.canActivate(context)).toThrow(BadRequestException);
    });
  });
});
