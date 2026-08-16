module.exports = {
  "*.{ts,tsx}": [
    "biome check --write",
    () => "tsc --noEmit -p apps/api/tsconfig.json",
    () => "npm run typecheck -w apps/web",
  ],
  "*.{js,jsx,json}": "biome check --write",
};
