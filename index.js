import express from "express";
import sharp from "sharp";
import cors from "cors";
import axios from "axios";
import multer from "multer";

const app = express();
app.use(cors());

// Keep multer for optional file upload compatibility
const upload = multer({ storage: multer.memoryStorage() });

async function downloadImage(url) {
  const response = await axios({
    method: "GET",
    url: url,
    responseType: "arraybuffer",
  });
  return Buffer.from(response.data, "binary");
}

function calculateTextPosition(
  imgWidth,
  imgHeight,
  textWidth,
  textHeight,
  position
) {
  const positions = {
    "top-center": { x: (imgWidth - textWidth) / 2, y: textHeight * 0.1 },
    center: { x: (imgWidth - textWidth) / 2, y: (imgHeight - textHeight) / 2 },
    "bottom-center": {
      x: (imgWidth - textWidth) / 2,
      y: imgHeight - textHeight * 1.2,
    },
  };
  return positions[position] || positions["center"];
}

app.post("/api/add-quote", async (req, res) => {
  try {
    const {
      imageUrl, // New parameter for image URL
      quote = "Default quote",
      textColor = "#FFFFFF",
      backgroundColor = "transparent",
      fontSize = 72,
      position = "center",
      maxWidth = 800,
    } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: "No image URL provided" });
    }

    // Download the image
    const imageBuffer = await downloadImage(imageUrl);
    const metadata = await sharp(imageBuffer).metadata();

    // Create SVG text
    const svgText = `
      <svg width="${metadata.width}" height="${metadata.height}">
        <style>
          .quote { 
            font-family: Arial; 
            font-size: ${fontSize}px; 
            fill: ${textColor}; 
            font-weight: bold;
          }
        </style>
        <rect width="100%" height="100%" fill="${backgroundColor}" opacity="0.5" />
        <foreignObject x="0" y="0" width="${maxWidth}" height="${
      metadata.height
    }">
          <div xmlns="http://www.w3.org/1999/xhtml" class="quote">
            ${quote.replace(/\n/g, "<br/>")}
          </div>
        </foreignObject>
      </svg>
    `;

    const svgBuffer = Buffer.from(svgText);

    // Process image
    const outputImage = await sharp(imageBuffer)
      .composite([
        {
          input: svgBuffer,
          gravity: position.includes("center") ? "center" : position,
          ...calculateTextPosition(
            metadata.width,
            metadata.height,
            maxWidth,
            quote.split("\n").length * fontSize * 1.2,
            position
          ),
        },
      ])
      .toBuffer();

    res.set("Content-Type", "image/jpeg");
    res.send(outputImage);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "Image processing failed",
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
