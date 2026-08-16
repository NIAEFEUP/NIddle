import * as Sentry from "@sentry/nestjs";
import { SentryTypeOrmLogger } from "./sentry-typeorm.logger";

jest.mock("@sentry/nestjs");

describe("SentryTypeOrmLogger", () => {
  let logger: SentryTypeOrmLogger;

  beforeEach(() => {
    logger = new SentryTypeOrmLogger();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(logger).toBeDefined();
  });

  describe("logQueryError", () => {
    it("adds a breadcrumb with the failing query and parameters", () => {
      const error = new Error("connection terminated");

      logger.logQueryError(error, "SELECT * FROM request WHERE id = $1", [
        "req-1",
      ]);

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        category: "typeorm",
        message: "Query Error",
        level: "error",
        data: {
          query: "SELECT * FROM request WHERE id = $1",
          parameters: ["req-1"],
          error,
        },
      });
    });

    it("does not report the error directly (relies on exception propagation)", () => {
      logger.logQueryError(new Error("boom"), "SELECT 1");

      expect(Sentry.captureException).not.toHaveBeenCalled();
      expect(Sentry.captureMessage).not.toHaveBeenCalled();
    });
  });

  describe("logQuerySlow", () => {
    it("reports the slow query to Sentry with execution time and parameters", () => {
      logger.logQuerySlow(500, "SELECT * FROM request WHERE status = $1", [
        "Pending",
      ]);

      expect(Sentry.captureMessage).toHaveBeenCalledWith(
        expect.stringContaining("SELECT * FROM request WHERE status = $1"),
        {
          level: "warning",
          extra: { time: 500, parameters: ["Pending"] },
        },
      );
    });

    it("does not add a breadcrumb (this call is the event itself)", () => {
      logger.logQuerySlow(500, "SELECT 1");

      expect(Sentry.addBreadcrumb).not.toHaveBeenCalled();
    });
  });

  describe("no-op / plain console methods", () => {
    it("logQuery does not call Sentry", () => {
      logger.logQuery();

      expect(Sentry.captureMessage).not.toHaveBeenCalled();
      expect(Sentry.addBreadcrumb).not.toHaveBeenCalled();
    });

    it("log, logSchemaBuild and logMigration do not throw or call Sentry", () => {
      expect(() => logger.log()).not.toThrow();
      expect(() => logger.logSchemaBuild()).not.toThrow();
      expect(() => logger.logMigration("migration ran")).not.toThrow();

      expect(Sentry.captureMessage).not.toHaveBeenCalled();
      expect(Sentry.addBreadcrumb).not.toHaveBeenCalled();
    });
  });
});
