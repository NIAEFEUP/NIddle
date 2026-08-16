module.exports = {
  "*.{ts,tsx,js,jsx,cjs,mjs,html,css,json}": "biome check --write",
  "apps/api/**/*.{ts,tsx}": () => "npm run typecheck -w apps/api",
  "apps/web/**/*.{ts,tsx}": () => "npm run typecheck -w apps/web",
};
