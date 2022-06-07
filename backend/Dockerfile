FROM node:14.17.1-alpine

WORKDIR /app
COPY ./domodachiBack/ /app/
COPY ./wait-for-it.sh /app/

RUN apk update && apk add bash
RUN apk --no-cache add --virtual builds-deps build-base python
RUN npm install
RUN npm build

EXPOSE 5500
