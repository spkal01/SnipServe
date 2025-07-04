# Use official Node.js image as the base
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Expose the port for Vite preview
EXPOSE 4174

# Start the application using Vite's preview mode
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4174"]