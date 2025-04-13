import express from "express";
import path from "path";
import compression from "compression";
import { fileURLToPath } from "url";
import { dirname } from "path";

const app = express();
const port = process.env.PORT || 3002;

app.use(compression());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

app.get("/build/index.html", (req, res) => {
  res.redirect(301, "/projects/build-sticker/");
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, "public", "not-found.html"));
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
