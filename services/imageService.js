import { downloadImage } from "../utils/httpUtils.js";
import { generateTextOverlay } from "./textService.js";
import sharp from "sharp";

export const processImageWithQuote = async (options) => {
  const imageBuffer = await downloadImage(options.imageUrl);
  const metadata = await sharp(imageBuffer).metadata();
  const overlay = await generateTextOverlay(options, metadata);

  return sharp(imageBuffer)
    .composite([
      {
        input: overlay.buffer,
        gravity: options.position || "center",
        top: calculateVerticalPosition(
          options.position || "center",
          metadata.height,
          overlay.dimensions.height,
          overlay.dimensions.padding
        ),
        left: calculateHorizontalPosition(
          options.position || "center",
          metadata.width,
          overlay.dimensions.width,
          overlay.dimensions.padding
        ),
      },
    ])
    .toBuffer();
};

const calculateVerticalPosition = (
  position,
  imageHeight,
  overlayHeight,
  padding
) => {
  // Handle combined positions like "bottom-left" or "top-right"
  const verticalPosition = position.split("-")[0];

  switch (verticalPosition) {
    case "top":
      return padding;
    case "bottom":
      // Ensure the overlay doesn't go below the image
      return Math.max(
        padding, // Minimum padding from bottom
        imageHeight - overlayHeight - padding
      );
    default: // center
      return Math.floor((imageHeight - overlayHeight) / 2);
  }
};

const calculateHorizontalPosition = (
  position,
  imageWidth,
  overlayWidth,
  padding
) => {
  // Handle combined positions like "bottom-left" or "top-right"
  const horizontalPosition = position.split("-")[1] || position.split("-")[0];

  switch (horizontalPosition) {
    case "left":
      return padding;
    case "right":
      // Ensure the overlay doesn't go beyond the image
      return Math.max(
        padding, // Minimum padding from right
        imageWidth - overlayWidth - padding
      );
    default: // center
      return Math.floor((imageWidth - overlayWidth) / 2);
  }
};
