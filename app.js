import express from "express";
import cors from "cors";
import { addQuoteToImage } from "./controllers/imageController.js";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/add-quote", addQuoteToImage);

export default app;
