FROM node:14-alpine
WORKDIR /usr/app

RUN apk add --update \
&& apk add --no-cache ca-certificates \
&& apk add --no-cache --virtual .build-deps curl
RUN curl -L https://unpkg.com/@pnpm/self-installer | node && apk del .build-deps

COPY . .
RUN pnpm i --r

CMD [ "npm", "run", "start:ws" ]