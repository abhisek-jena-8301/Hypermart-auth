FROM node:22

WORKDIR /auth

COPY . .

RUN npm install

EXPOSE 3001

CMD [ "npm","run","dev" ]
