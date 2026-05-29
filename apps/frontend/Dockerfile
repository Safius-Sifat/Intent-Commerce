# syntax=docker/dockerfile:1
FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better caching)
COPY apps/frontend/package.json ./
COPY packages/shared/package.json /packages/shared/package.json
COPY packages/shared/src /packages/shared/src
COPY packages/shared/tsconfig.json /packages/shared/tsconfig.json

# Install pnpm or use npm. Using npm for simplicity.
RUN npm install -g npm@latest
RUN npm install

# Copy source code
COPY apps/frontend/src ./src
COPY apps/frontend/next.config.js ./
COPY apps/frontend/tailwind.config.ts ./
COPY apps/frontend/postcss.config.js ./
COPY apps/frontend/tsconfig.json ./
COPY apps/frontend/components.json ./
COPY apps/frontend/src/app/globals.css ./src/app/globals.css

EXPOSE 3000

CMD ["npm", "run", "dev"]
