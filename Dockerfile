FROM node:22-alpine

WORKDIR /usr/src/app

USER node

COPY --chown=node:node package*.json ./

RUN npm ci

COPY . .

RUN npm run build


EXPOSE 3000

CMD [ "node", "dist/main" ]
