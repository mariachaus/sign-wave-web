FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL=""
ARG VITE_BASE_PATH="/"
ARG VITE_GOOGLE_CLIENT_ID=""

ENV VITE_API_URL=${VITE_API_URL} \
    VITE_BASE_PATH=${VITE_BASE_PATH} \
    VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}

RUN npm run build

FROM caddy:2-alpine

COPY --from=build /app/dist /srv

EXPOSE 80 443
