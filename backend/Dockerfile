FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
ENV PORT=8000
EXPOSE ${PORT}
CMD ["node", "server.js"]
