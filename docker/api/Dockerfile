FROM node:14-alpine
WORKDIR /usr/app

RUN apk add --update \
&& apk add --no-cache ca-certificates \
&& apk add --no-cache --virtual .build-deps curl
RUN curl -L https://unpkg.com/@pnpm/self-installer | node && apk del .build-deps

COPY package*.json tsconfig.base.json pnpm-workspace.yaml ./
COPY ./packages/. packages/
COPY ./services/api/package.json services/api/
RUN pnpm i --r
COPY ./services/api/. services/api/

RUN pnpm run build
CMD [ "npm", "run", "start:api" ]