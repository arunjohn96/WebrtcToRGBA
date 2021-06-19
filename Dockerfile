FROM node:10-slim

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
RUN apt-get update || : && apt-get install python -y

WORKDIR /home/node/app

COPY package*.json ./

USER node

RUN npm install

COPY --chown=node:node . .

EXPOSE 8000

CMD [ "node", "index.js" ]