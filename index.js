import express from "express";
import multer from "multer";
import sharp from "sharp";
import cors from "cors";

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());

// Enhanced text positioning function
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
    // Add more positions as needed
  };

  return positions[position] || positions["center"];
}

app.post("/api/add-quote", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const {
      quote = "Default quote",
      textColor = "#FFFFFF",
      backgroundColor = "transparent",
      fontSize = 72,
      position = "center",
      maxWidth = 800, // pixels for text wrapping
    } = req.body;

    // Get image metadata
    const metadata = await sharp(req.file.buffer).metadata();

    // Create SVG text with automatic wrapping
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
    const outputImage = await sharp(req.file.buffer)
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
    res
      .status(500)
      .json({ error: "Image processing failed", details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
