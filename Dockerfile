FROM node:16.14.2

WORKDIR /app

COPY ./ /app

ENV MONGODB_URI=mongodb://mongo:27017/devchallenge 
ENV NEO4J_SCHEME=neo4j 
ENV NEO4J_HOST=neo4j 
ENV NEO4J_PORT=7687 
ENV NEO4J_USER=neo4j 
ENV NEO4J_PASSWORD=neo 

RUN npm i -g pm2 \
    && npm i \
    && npm run build \
    && rm -rf node_modules \
    && npm i --production

CMD pm2 start dist/main.js --no-daemon