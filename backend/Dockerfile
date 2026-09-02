# ==============================
# Dependencies stage
# ==============================

FROM node:20-alpine AS DEPS

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

COPY package.json package-lock.json ./

RUN npm ci

# ==============================
# Build stage
# ==============================

FROM node:20-alpine AS BUILDER

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

COPY --from=DEPS /app/node_modules ./node_modules

COPY package.json package-lock.json ./

COPY prisma ./prisma

COPY tsconfig.json tsconfig.build.json nest-cli.json ./

COPY src ./src

RUN npx prisma generate && npm run build

# ==============================
# Production stage
# ==============================

FROM node:20-alpine AS RUNNER

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4000

RUN apk add --no-cache \
    openssl \
    libc6-compat \
    wget \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ttf-freefont \
    udev \
    ca-certificates

COPY package.json package-lock.json ./

COPY prisma ./prisma

RUN npm ci --omit=dev 

COPY --from=BUILDER /app/dist ./dist

COPY --from=BUILDER /app/node_modules/.prisma ./node_modules/.prisma

COPY --from=BUILDER /app/node_modules/@prisma ./node_modules/@prisma

COPY --from=BUILDER /app/prisma ./prisma

COPY src/database/scripts/entrypoint.sh /app/entrypoint.sh
COPY src/database/scripts/safe-migration.sh /app/safe-migration.sh

EXPOSE ${PORT?:-4000}

HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
    CMD wget -qO- http://127.0.0.1:${PORT}/api/health/live || exit 1

RUN chmod +x /entrypoint.sh /safe-migration.sh

ENTRYPOINT [ "/entrypoint.sh" ]