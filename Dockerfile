FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies for the server
RUN npm install --production

# Copy application code
COPY . .

# --- CACHE BUST: 2025-09-02-01 ---
# Build the React frontend
WORKDIR /app/client_backup
RUN npm install
RUN npm run build

# Go back to server root
WORKDIR /app

# Expose port
# Force rebuild: update port and add comment
# Last updated: 2025-09-02
EXPOSE 8080

# Start the application
CMD ["npm", "start"]