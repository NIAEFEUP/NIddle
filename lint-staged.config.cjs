module.exports = {
  "*.{ts,tsx}": ["biome check --write", () => "tsc --noEmit"],
  "*.{js,jsx,json}": "biome check --write",
};
