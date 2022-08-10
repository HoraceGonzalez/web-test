FROM node:erbium-alpine
ARG BUILD_ENV=development

WORKDIR /app

COPY ./api/package.json /app
COPY ./api/yarn.lock /app

RUN yarn add global typescript
RUN yarn add global tsc-watch
RUN yarn add global pg

RUN yarn install --force

COPY ./api /app

EXPOSE 8080

CMD ["yarn", "run", "dev"]
