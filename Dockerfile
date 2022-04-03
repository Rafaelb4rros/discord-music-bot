FROM node:16.13.0

RUN apt-get update || : && apt-get install python -y
RUN apt-get install ffmpeg -y

WORKDIR /discord-music-bot/

COPY package*.json ./

RUN npm ci

COPY . .

USER node

CMD npm start