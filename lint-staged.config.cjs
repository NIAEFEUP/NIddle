module.exports = {
  "*.{ts,tsx,js,jsx,json}": "biome check --write",
  "*.{ts,tsx}": () => "tsc --noEmit",
};
