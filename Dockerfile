FROM node:16.14.2

WORKDIR /app

COPY ./ /app

RUN npm i -g pm2 \
    && npm i \
    && npm run build \
    && rm -rf node_modules \
    && npm i --production

CMD pm2 start dist/main.js --no-daemon