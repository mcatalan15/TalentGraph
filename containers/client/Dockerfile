FROM node:25-alpine3.22

ENV TZ=Europe/Madrid

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 8080

CMD ["npm", "start"]