FROM node:18

#Set working directory
WORKDIR /app

#Copy over package.json files
COPY package*.json ./

#Install dependancies
RUN npm install

#Copy over all needed files
COPY app.js ./
COPY /db ./db

#Expose port
EXPOSE 3000

#Run app
ENTRYPOINT npm start
