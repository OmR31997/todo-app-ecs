FROM node:20-alpine AS BUILDER

WORKDIR /app

ARG NEXT_PUBLIC_API_BASE_URL

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build


FROM node:20-alpine AS RUNNER

WORKDIR /app

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=BUILDER /app/.next ./.next
COPY --from=BUILDER /app/public ./public
COPY --from=BUILDER /app/next.config.* ./

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
    CMD wget -qO- http://127.0.0.1:3000/api/health/live || exit 1

CMD ["npm", "start"]