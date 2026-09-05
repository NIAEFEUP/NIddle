export default async function globalTeardown() {
  const container = (globalThis as Record<string, unknown>).__TESTCONTAINER__;
  if (
    container &&
    typeof (container as { stop: () => Promise<void> }).stop === "function"
  ) {
    await (container as { stop: () => Promise<void> }).stop();
  }
}
