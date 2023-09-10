FROM node:18

WORKDIR /usr/src/app

RUN npm install body-parser cookie-parser ejs express nodemon sqlite3

COPY . .

COPY package*.json ./

COPY . .

EXPOSE 8000

CMD ["node", "app.js"]