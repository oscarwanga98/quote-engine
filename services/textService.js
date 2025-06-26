import { DEFAULT_CONFIG } from "../config/constants.js";
import opentype from "opentype.js";

// Load font (should be done once at startup)
let font;
try {
  font = await opentype.load("node_modules/opentype.js/dist/fonts/Arial.ttf");
} catch (err) {
  console.warn("Couldn't load Arial font, using default metrics");
}

export const generateTextOverlay = async (options, metadata) => {
  const config = { ...DEFAULT_CONFIG, ...options };

  // Dynamic Padding Adjustment
  const dynamicPadding = Math.max(
    config.padding,
    Math.ceil(config.fontSize * 0.5) // At least half of font size
  );

  // Calculate dimensions
  const maxWidthPixels = Math.floor(
    (metadata.width * config.maxWidthPercentage) / 100
  );

  // Font Metrics Consideration
  let lineHeight, baselineAdjustment;
  if (font) {
    const fontScale = (1 / font.unitsPerEm) * config.fontSize;
    lineHeight = (font.ascender - font.descender) * fontScale * 1.2;
    baselineAdjustment = font.descender * fontScale;
  } else {
    lineHeight = config.fontSize * 1.5;
    baselineAdjustment = config.fontSize * 0.2;
  }

  // Text Overflow Handling
  const maxCharsPerLine = Math.floor(maxWidthPixels / (config.fontSize * 0.55));
  const lines = wrapTextWithEllipsis(config.quote, maxCharsPerLine);

  // Calculate text block dimensions
  const textBlockHeight =
    lines.length * lineHeight - (lineHeight - config.fontSize);
  const verticalPadding = dynamicPadding * 2;

  // Calculate SVG dimensions
  const svgWidth = Math.max(100, maxWidthPixels - dynamicPadding * 2);
  const svgHeight = Math.max(
    config.fontSize * 2,
    textBlockHeight + verticalPadding
  );

  // Calculate text vertical position
  const textVerticalPosition =
    dynamicPadding + config.fontSize - baselineAdjustment;

  const svgText = `
    <svg width="${svgWidth}" height="${svgHeight}" 
         xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" 
            fill="${config.backgroundColor}" 
            rx="${config.cornerRadius}" ry="${config.cornerRadius}"/>
      <text x="50%" y="${textVerticalPosition}"
            font-family="Arial, sans-serif"
            font-size="${config.fontSize}"
            fill="${config.textColor}"
            font-weight="bold"
            text-anchor="middle"
            dominant-baseline="alphabetic">
        ${lines
          .map(
            (line, i) =>
              `<tspan x="50%" dy="${i === 0 ? 0 : lineHeight}">${line}</tspan>`
          )
          .join("")}
      </text>
    </svg>
  `;

  return {
    buffer: Buffer.from(svgText),
    dimensions: {
      width: svgWidth,
      height: svgHeight,
      padding: dynamicPadding,
      lineHeight: lineHeight,
      textBlockHeight: textBlockHeight,
    },
  };
};

// Text Overflow Handling with Ellipsis
function wrapTextWithEllipsis(text, maxLineLength) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  words.forEach((word) => {
    if ((currentLine + word).length <= maxLineLength) {
      currentLine += (currentLine ? " " : "") + word;
    } else {
      if (currentLine) {
        if (lines.length === 2 && words.length > 15) {
          // Only show ellipsis if many words
          lines.push(currentLine.slice(0, maxLineLength - 3) + "...");
          return;
        }
        lines.push(currentLine);
      }
      currentLine = word;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.slice(0, 3); // Max 3 lines
}
