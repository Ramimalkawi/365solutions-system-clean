FROM node:18-alpine

WORKDIR /app

# Copy only server files first
COPY package*.json ./
COPY server.js ./
COPY Procfile ./
COPY railway.json ./
COPY render.yaml ./
COPY start.sh ./
COPY server/ ./server/

# Install dependencies for the server
RUN npm install --production

# --- CACHE BUST: 2025-09-02-02 ---
# --- AGGRESSIVE CACHE BUST: 2025-09-02-03 ---
COPY client_backup/cachebust.txt ./client_backup/cachebust.txt
# Copy and build the React frontend
COPY client_backup ./client_backup
WORKDIR /app/client_backup
RUN npm install
RUN npm run build

# Go back to server root
WORKDIR /app

# Copy the rest of the files (if needed)
COPY . .

# Expose port
# Force rebuild: update port and add comment
# Last updated: 2025-09-02
EXPOSE 8080

# Start the application
CMD ["npm", "start"]