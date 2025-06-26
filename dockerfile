# Use official Node.js image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies first for better caching
COPY package*.json ./

# Install sharp dependencies and npm packages
RUN apk add --no-cache --virtual .build-deps \
    g++ \
    make \
    python3 \
    && npm install \
    && apk del .build-deps

# Copy source files
COPY . .

# Install OpenType.js fonts
RUN mkdir -p node_modules/opentype.js/dist/fonts \
    && wget https://cdn.jsdelivr.net/npm/opentype.js@1.3.4/dist/fonts/Arial.ttf \
    -O node_modules/opentype.js/dist/fonts/Arial.ttf

# Build the app (if needed)
RUN npm run build

# Expose port
EXPOSE 3000

# Run the app
CMD ["npm", "start"]