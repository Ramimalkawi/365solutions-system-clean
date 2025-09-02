FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies for the server
RUN npm install --production

# Copy application code
COPY . .

# Build the React frontend
WORKDIR /app/client_backup
RUN npm install
RUN npm run build

# Go back to server root
WORKDIR /app

# Expose port
EXPOSE 10000

# Start the application
CMD ["npm", "start"]