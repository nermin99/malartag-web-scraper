FROM node:18-alpine
RUN apk add chromium

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY .env .env
COPY index.js index.js

CMD [ "npm", "start" ]
