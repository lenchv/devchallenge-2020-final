FROM node:16.14.2

WORKDIR /app

COPY ./ /app

env DB_HOST=db
env DB_PORT=3306
env DB_USER=root
env DB_PASSWORD=secret
env DB_NAME=mydb

RUN npm i -g pm2 \
    && npm i \
    && npm run build \
    && rm -rf node_modules \
    && npm i --production

CMD pm2 start dist/src/main.js --no-daemon