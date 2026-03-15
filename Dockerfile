FROM node:18-alpine

# Create app dir
WORKDIR /usr/src/app

# install deps (package-lock.json optional)
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# copy app
COPY . .

# ensure NODE_ENV=production for smaller footprint
ENV NODE_ENV=production

CMD ["node", "index.js"]
