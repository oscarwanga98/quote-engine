import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { addQuoteToImage } from "./controllers/imageController.js";

const app = express();
// Get the current directory path (needed for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(cors());
app.use(express.json());

app.post("/api/add-quote", addQuoteToImage);
app.get("/readme", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "readme.html"));
});

export default app;
