# **Quote Image Overlay API Documentation**  

## **Overview**  
This API allows users to overlay text quotes on images with customizable styling, positioning, and dimensions. It processes an image URL and generates a new image with the provided text overlaid in a styled container.  

---

## **API Endpoint**  
### **POST `/api/add-quote`**  
Overlays text on an image and returns the modified image.  

#### **Request Body (JSON)**  
| Parameter            | Type   | Default Value               | Description |
|----------------------|--------|-----------------------------|-------------|
| `imageUrl`           | string | **Required**                | URL of the source image |
| `quote`              | string | `"Default quote"`           | Text to overlay |
| `textColor`          | string | `"#FFFFFF"` (white)         | Text color (hex or rgba) |
| `backgroundColor`    | string | `"rgba(0, 0, 0, 0.7)"`     | Background color of the text box (hex or rgba) |
| `fontSize`           | number | `48`                        | Font size in pixels |
| `position`           | string | `"center"`                  | Text box position (`top`, `bottom`, `center`, `top-left`, `bottom-right`, etc.) |
| `maxWidthPercentage`  | number | `80`                        | Max width of the text box (percentage of image width) |
| `cornerRadius`       | number | `15`                        | Border radius of the text box |
| `padding`            | number | `30`                        | Inner padding around the text |

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

