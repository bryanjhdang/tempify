FROM node

WORKDIR /usr/src/app

# ENV HOST 0.0.0.0
# ENV PORT 8080
EXPOSE 8080

COPY package*.json ./
COPY . .

RUN npm install
RUN npm run build

CMD [ "npm", "run", "start"]