FROM node:20-alpine AS BUILDER

WORKDIR /app

ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NODE_OPTIONS="--max-old-space-size=1536"

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build


FROM node:20-alpine AS RUNNER

WORKDIR /app

ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NODE_ENV=production

COPY --from=BUILDER /app/public ./public
COPY --from=BUILDER /app/.next/standalone ./
COPY --from=BUILDER /app/.next/static ./.next/static

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
    CMD wget -qO- http://127.0.0.1:3000/api/health/live || exit 1

CMD ["node", "server.js"]