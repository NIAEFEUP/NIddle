import { ENTITIES, getDataSourceOptions } from "./data-source";

describe("DataSource Configuration", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = {
      ...OLD_ENV,
      DATABASE_MASTER: "test-master",
      DATABASE_USER: "test-user",
      DATABASE_PASSWORD: "test-password",
      DATABASE_NAME: "test-db",
    };
    delete process.env.DATABASE_SLAVE;
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it("should define all entities", () => {
    expect(ENTITIES.length).toBeGreaterThan(0);
  });

  it("should configure migrations", () => {
    const options = getDataSourceOptions();
    expect(options.migrations).toBeDefined();
    expect(Array.isArray(options.migrations)).toBe(true);
  });

  it("should enable synchronize only in development", () => {
    process.env.NODE_ENV = "development";
    const devOptions = getDataSourceOptions();
    expect(devOptions.synchronize).toBe(true);

    process.env.NODE_ENV = "production";
    const prodOptions = getDataSourceOptions();
    expect(prodOptions.synchronize).toBe(false);

    process.env.NODE_ENV = "test";
    const testOptions = getDataSourceOptions();
    expect(testOptions.synchronize).toBe(false);
  });

  it("should configure replication when DATABASE_SLAVE is provided", () => {
    process.env.DATABASE_SLAVE = "test-slave";
    const options = getDataSourceOptions() as any;

    expect(options.replication).toBeDefined();
    expect(options.replication.master.host).toBe("test-master");
    expect(options.replication.slaves[0].host).toBe("test-slave");
  });

  it("should configure single host when DATABASE_SLAVE is not set", () => {
    delete process.env.DATABASE_SLAVE;
    const options = getDataSourceOptions() as any;

    expect(options.replication).toBeUndefined();
    expect(options.host).toBe("test-master");
  });

  it("should use custom DATABASE_PORT when provided", () => {
    process.env.DATABASE_PORT = "5433";
    const options = getDataSourceOptions() as any;
    expect(options.port).toBe(5433);
  });

  it("should default to 5432 when DATABASE_PORT is not set", () => {
    delete process.env.DATABASE_PORT;
    const options = getDataSourceOptions() as any;
    expect(options.port).toBe(5432);
  });
});
