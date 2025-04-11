FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY apps/dashboard/package.json apps/dashboard/pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application and Prisma schema
COPY . .

# Set up the working directory
WORKDIR /app/apps/dashboard

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY apps/dashboard/package.json apps/dashboard/pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built application from builder
# COPY --from=builder /app/apps/dashboard/.next ./.next
# COPY --from=builder /app/apps/dashboard/public ./public
# COPY --from=builder /app/apps/dashboard/next.config.ts ./
# COPY --from=builder /app/apps/dashboard/next-env.d.ts ./

# Set up the working directory
WORKDIR /app/apps/dashboard 
