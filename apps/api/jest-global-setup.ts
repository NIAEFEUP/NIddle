import { GenericContainer, Wait } from "testcontainers";

export default async function globalSetup() {
  const container = await new GenericContainer("postgres:16")
    .withEnvironment({
      POSTGRES_USER: "test",
      POSTGRES_PASSWORD: "test",
      POSTGRES_DB: "niddle_test",
    })
    .withExposedPorts(5432)
    .withWaitStrategy(
      Wait.forLogMessage("database system is ready to accept connections", 2),
    )
    .start();

  process.env.TEST_DATABASE_HOST = container.getHost();
  process.env.TEST_DATABASE_PORT = String(container.getMappedPort(5432));
  process.env.TEST_DATABASE_USER = "test";
  process.env.TEST_DATABASE_PASSWORD = "test";
  process.env.TEST_DATABASE_NAME = "niddle_test";

  (globalThis as Record<string, unknown>).__TESTCONTAINER__ = container;
}
