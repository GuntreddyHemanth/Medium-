# Use Node Alpine as base image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./

RUN npm install

# Copy everything to the container
COPY . .

# Expose Vite development server port
EXPOSE 5173

# Run Vite dev server
CMD ["npm", "run", "dev", "--", "--host"]






# #Build stage
# FROM node:22-alpine

# WORKDIR /app

# COPY package*.json .

# RUN npm install

# COPY . .

# RUN npm run build

# EXPOSE 5173

# CMD ["node", "dist/index.html"]

# #Production stage
# FROM node:16-alpine AS production

# WORKDIR /app

# COPY package*.json .

# RUN npm ci --only=production

# COPY --from=build /app/dist ./dist

