FROM node:20-alpine

# Native build tools required for better-sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev

COPY index.js .

EXPOSE 3001
CMD ["node", "index.js"]
