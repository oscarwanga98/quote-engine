import { downloadImage } from "../utils/httpUtils.js";
import { generateTextOverlay } from "./textService.js";
import sharp from "sharp";

export const processImageWithQuote = async (options) => {
  const imageBuffer = await downloadImage(options.imageUrl);
  const metadata = await sharp(imageBuffer).metadata();
  const overlay = await generateTextOverlay(options, metadata);

  // Calculate positions without relying on gravity
  const { top, left } = calculatePositions(
    options.position || "center",
    metadata.width,
    metadata.height,
    overlay.dimensions.width,
    overlay.dimensions.height,
    overlay.dimensions.padding
  );

  return sharp(imageBuffer)
    .composite([
      {
        input: overlay.buffer,
        top: Math.round(top),
        left: Math.round(left),
      },
    ])
    .toBuffer();
};

const calculatePositions = (
  position,
  imageWidth,
  imageHeight,
  overlayWidth,
  overlayHeight,
  padding
) => {
  // Normalize position (handle cases like "bottom-left")
  const [verticalPos, horizontalPos] = position.includes("-")
    ? position.split("-")
    : [position, position];

  // Calculate vertical position
  let top;
  switch (verticalPos) {
    case "top":
      top = padding;
      break;
    case "bottom":
      top = imageHeight - overlayHeight - padding;
      break;
    default: // center
      top = (imageHeight - overlayHeight) / 2;
  }

  // Calculate horizontal position
  let left;
  switch (horizontalPos) {
    case "left":
      left = padding;
      break;
    case "right":
      left = imageWidth - overlayWidth - padding;
      break;
    default: // center
      left = (imageWidth - overlayWidth) / 2;
  }

  // Ensure positions stay within image bounds
  return {
    top: Math.max(
      padding,
      Math.min(top, imageHeight - overlayHeight - padding)
    ),
    left: Math.max(
      padding,
      Math.min(left, imageWidth - overlayWidth - padding)
    ),
  };
};
