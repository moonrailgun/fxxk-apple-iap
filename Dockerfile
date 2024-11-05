# Use Node.js alpine image for smaller size
FROM node:18-alpine

# Set working directory
WORKDIR /app

RUN npm install -g pnpm@8.15.8

# Copy source code
COPY . .

# Install dependencies
RUN pnpm install

# Build the application
RUN pnpm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
