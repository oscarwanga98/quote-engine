# **Quote Image Overlay API Documentation**

## **Overview**

This API allows users to overlay text quotes on images with customizable styling, positioning, and dimensions. It processes an image URL and generates a new image with the provided text overlaid in a styled container.

---

## **API Endpoint**

### **POST `/api/add-quote`**

Overlays text on an image and returns the modified image.

Testlink `https://quote-engine.onrender.com/api/add-quote`

#### **Request Body (JSON)**

| Parameter            | Type   | Default Value          | Description                                                                     |
| -------------------- | ------ | ---------------------- | ------------------------------------------------------------------------------- |
| `imageUrl`           | string | **Required**           | URL of the source image                                                         |
| `quote`              | string | `"Default quote"`      | Text to overlay                                                                 |
| `textColor`          | string | `"#FFFFFF"` (white)    | Text color (hex or rgba)                                                        |
| `backgroundColor`    | string | `"rgba(0, 0, 0, 0.7)"` | Background color of the text box (hex or rgba)                                  |
| `fontSize`           | number | `48`                   | Font size in pixels                                                             |
| `position`           | string | `"center"`             | Text box position (`top`, `bottom`, `center`, `top-left`, `bottom-right`, etc.) |
| `maxWidthPercentage` | number | `80`                   | Max width of the text box (percentage of image width)                           |
| `cornerRadius`       | number | `15`                   | Border radius of the text box                                                   |
| `padding`            | number | `30`                   | Inner padding around the text                                                   |

#### **Example Request**

```json
{
  "imageUrl": "https://example.com/image.jpg",
  "quote": "Success is not final, failure is not fatal",
  "textColor": "#FFFFFF",
  "backgroundColor": "rgba(0, 0, 0, 0.7)",
  "fontSize": 48,
  "position": "bottom-right",
  "maxWidthPercentage": 70,
  "cornerRadius": 10,
  "padding": 20
}
```

#### **Response**

- **Success:** Returns the modified image as a JPEG binary.
- **Error:** Returns JSON with an error message.

---

## **Usage Examples**

### **1. Basic Usage (Default Styling)**

```bash
curl -X POST http://localhost:3000/api/add-quote \
-H "Content-Type: application/json" \
-d '{
  "imageUrl": "https://example.com/image.jpg",
  "quote": "Stay hungry, stay foolish"
}'
```

### **2. Custom Styling & Positioning**

```bash
curl -X POST http://localhost:3000/api/add-quote \
-H "Content-Type: application/json" \
-d '{
  "imageUrl": "https://example.com/image.jpg",
  "quote": "The only way to do great work is to love what you do",
  "textColor": "#FF5733",
  "backgroundColor": "rgba(255, 255, 255, 0.8)",
  "fontSize": 42,
  "position": "top-left",
  "padding": 25
}'
```

### **3. Minimal Width & Rounded Corners**

```bash
curl -X POST http://localhost:3000/api/add-quote \
-H "Content-Type: application/json" \
-d '{
  "imageUrl": "https://example.com/image.jpg",
  "quote": "Less is more",
  "maxWidthPercentage": 60,
  "cornerRadius": 20
}'
```

---

## **Recommendations for Improvement**

### **1. Better Text Wrapping & Overflow Handling**

- **Current:** Uses a simple character-based wrap.
- **Improvement:** Implement **word-aware wrapping** with hyphenation for long words.
- **Example:**
  ```javascript
  // Use a library like 'text-segmentation' for better wrapping
  import { segment } from "text-segmentation";
  const lines = segment(quote, { maxLength: maxCharsPerLine });
  ```

### **2. Font Customization**

- **Current:** Only supports Arial (fallback to default metrics).
- **Improvement:** Allow **custom font uploads** or Google Fonts integration.
- **Example:**
  ```javascript
  // Allow font URL in request
  fontUrl: "https://fonts.googleapis.com/css2?family=Roboto";
  ```

### **3. Dynamic Background Sizing**

- **Current:** Fixed padding-based sizing.
- **Improvement:** Auto-adjust background box height based on **actual text height**.
- **Example:**
  ```javascript
  // Use canvas/text-measure to get exact text dimensions
  const textMetrics = measureText(quote, { fontSize, fontFamily });
  const svgHeight = textMetrics.height + padding * 2;
  ```

### **4. Multi-Language Support**

- **Current:** Basic English text handling.
- **Improvement:** Add **RTL (Right-to-Left) support** for Arabic/Hebrew.
- **Example:**
  ```javascript
  // Detect language and adjust text direction
  if (isRTL(quote)) {
    svgText += ` direction="rtl"`;
  }
  ```

### **5. Caching & Performance Optimization**

- **Current:** Processes images on every request.
- **Improvement:** Cache processed images using **Redis/CDN**.
- **Example:**
  ```javascript
  // Cache key based on request params
  const cacheKey = `${imageUrl}-${quote}-${fontSize}-${position}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);
  ```

### **6. Error Handling for Image Fetching**

- **Current:** Basic timeout.
- **Improvement:** Add **retry mechanism** for failed downloads.
- **Example:**
  ```javascript
  const imageBuffer = await retry(() => downloadImage(url), { retries: 3 });
  ```

---

## **Conclusion**

This API provides a simple way to overlay text on images with customizable styling. Future improvements could include better text handling, font flexibility, and performance optimizations.

For contributions or issues, refer to the [GitHub repository](https://github.com/oscarwanga98/quote-engine.git). 🚀
