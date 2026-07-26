import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const apiTarget = process.env.API_URL || "http://localhost:3001";

app.use(
  "/api",
  createProxyMiddleware({
    target: apiTarget,
    changeOrigin: true,
  }),
);

app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(port, () => {
  console.log(
    `Server is running on port ${port}, proxying /api to ${apiTarget}`,
  );
});
