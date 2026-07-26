import { ForbiddenException } from "@nestjs/common";
import { AdminOnlyGuard } from "./admin-only.guard";

describe("AdminOnlyGuard", () => {
  let guard: AdminOnlyGuard;

  beforeEach(() => {
    guard = new AdminOnlyGuard();
  });

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  it("should throw ForbiddenException if user is not present", () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
    } as any;

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it("should throw ForbiddenException if user is not admin", () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 1, isAdmin: false },
        }),
      }),
    } as any;

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it("should return true if user is admin", () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 1, isAdmin: true },
        }),
      }),
    } as any;

    expect(guard.canActivate(context)).toBe(true);
  });
});
