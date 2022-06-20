FROM node:18.3.0-bullseye-slim

WORKDIR /app
COPY ./domodachiBack/ /app/
COPY ./wait-for-it.sh /app/

# RUN apt -y update && apt -y upgrade
RUN npm install
# RUN npm build

EXPOSE 5500
