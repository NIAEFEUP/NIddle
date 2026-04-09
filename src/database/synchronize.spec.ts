import { getDatabaseSynchronize } from "./synchronize";

describe("getDatabaseSynchronize", () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
        process.env = { ...OLD_ENV };
        delete process.env.DATABASE_SYNCHRONIZE;
        delete process.env.NODE_ENV;
    });

    afterEach(() => {
        process.env = OLD_ENV;
    });

    it("should always enable synchronize in test environment", () => {
        process.env.NODE_ENV = "test";
        process.env.DATABASE_SYNCHRONIZE = "false";

        expect(getDatabaseSynchronize()).toBe(true);
    });

    it("should respect synchronize override when true", () => {
        process.env.NODE_ENV = "production";
        process.env.DATABASE_SYNCHRONIZE = "true";

        expect(getDatabaseSynchronize()).toBe(true);
    });

    it("should respect synchronize override when false", () => {
        process.env.NODE_ENV = "development";
        process.env.DATABASE_SYNCHRONIZE = "false";

        expect(getDatabaseSynchronize()).toBe(false);
    });

    it("should disable synchronize by default in production", () => {
        process.env.NODE_ENV = "production";

        expect(getDatabaseSynchronize()).toBe(false);
    });

    it("should enable synchronize by default outside production", () => {
        process.env.NODE_ENV = "development";

        expect(getDatabaseSynchronize()).toBe(true);
    });
});