import express from "express";
import sharp from "sharp";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

async function downloadImage(url) {
  const response = await axios({
    method: "GET",
    url: url,
    responseType: "arraybuffer",
    timeout: 10000,
  });
  return Buffer.from(response.data, "binary");
}

function wrapText(text, maxLineLength = 30) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  words.forEach((word) => {
    if ((currentLine + word).length <= maxLineLength) {
      currentLine += (currentLine ? " " : "") + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });

  if (currentLine) lines.push(currentLine);
  return lines;
}

app.post("/api/add-quote", async (req, res) => {
  try {
    const {
      imageUrl,
      quote = "Default quote",
      textColor = "#FFFFFF",
      backgroundColor = "rgba(0, 0, 0, 0.7)",
      fontSize = 48,
      position = "center",
      maxWidthPercentage = 80, // Percentage of image width
      cornerRadius = 15, // Rounded corners
      padding = 30,
    } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: "imageUrl is required" });
    }

    // Download image
    const imageBuffer = await downloadImage(imageUrl);
    const metadata = await sharp(imageBuffer).metadata();

    // Calculate max width based on percentage of image width
    const maxWidthPixels = Math.floor(
      (metadata.width * maxWidthPercentage) / 100
    );

    // Wrap text to fit within the max width
    const maxCharsPerLine = Math.floor(maxWidthPixels / (fontSize * 0.6)); // Approximate chars per line
    const lines = wrapText(quote, maxCharsPerLine);

    // Calculate dimensions
    const lineHeight = fontSize * 1.4;
    const textHeight = lines.length * lineHeight;
    const svgWidth = maxWidthPixels - padding * 2;
    const svgHeight = textHeight + padding * 2;

    // Create SVG with proper text wrapping and rounded corners
    const svgText = `
      <svg width="${svgWidth}" height="${svgHeight}" 
           xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" 
              fill="${backgroundColor}" 
              rx="${cornerRadius}" ry="${cornerRadius}"/>
        <text x="50%" y="50%"
              font-family="Arial, sans-serif"
              font-size="${fontSize}"
              fill="${textColor}"
              font-weight="bold"
              text-anchor="middle"
              dominant-baseline="middle">
          ${lines
            .map(
              (line, i) =>
                `<tspan x="50%" dy="${
                  i === 0 ? 0 : lineHeight
                }">${line}</tspan>`
            )
            .join("")}
        </text>
      </svg>
    `;

    // Calculate position
    let top;
    switch (position) {
      case "top":
        top = padding;
        break;
      case "bottom":
        top = metadata.height - svgHeight - padding;
        break;
      case "center":
      default:
        top = Math.floor((metadata.height - svgHeight) / 2);
    }

    // Composite image
    const outputImage = await sharp(imageBuffer)
      .composite([
        {
          input: Buffer.from(svgText),
          gravity: position,
          top: top,
          left: Math.floor((metadata.width - svgWidth) / 2),
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
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
