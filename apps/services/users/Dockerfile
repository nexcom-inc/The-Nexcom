# Stage 1: Build the application
FROM docker.io/node:20 AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (or pnpm-lock.yaml if using pnpm)
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN npm install -g pnpm && pnpm install

# Copy the rest of the application code
COPY . .

# Build the application using nx
RUN rm -rf .nx
RUN npx nx build users

# Stage 2: Create the final image
FROM docker.io/node:lts-alpine

# Set environment variables


# Set working directory
WORKDIR /app

# Create a non-root user
RUN addgroup --system userservice && \
    adduser --system -G userservice userservice

# Copy the built application from the builder stage
COPY --from=builder /app/dist/apps/services/users ./users

# Install production dependencies
RUN npm --prefix users --omit=dev -f install

# Change ownership of the application directory
RUN chown -R userservice:userservice .

# Switch to the non-root user
USER userservice


# Start the application
CMD [ "node", "users/main.js" ]
