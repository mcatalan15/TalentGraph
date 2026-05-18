FROM node:25-alpine3.22

WORKDIR /app

COPY package.json .

RUN npm install viem

COPY . .

EXPOSE 8080

CMD ["npm", "start"]