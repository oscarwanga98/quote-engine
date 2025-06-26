import { processImageWithQuote } from "../services/imageService.js";
import { validateRequest } from "../utils/validationUtils.js";

export const addQuoteToImage = async (req, res) => {
  try {
    const validationError = validateRequest(req);
    if (validationError) return res.status(400).json(validationError);

    const outputImage = await processImageWithQuote(req.body);

    res.set("Content-Type", "image/jpeg");
    res.send(outputImage);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "Image processing failed",
      details: error.message,
    });
  }
};
