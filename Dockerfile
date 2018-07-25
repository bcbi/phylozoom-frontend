# Dockerfile
FROM node:9

# Create app directory
RUN mkdir -p /usr/src/phylozoom_frontend
WORKDIR /usr/src/phylozoom_frontend

# Bundle app source
COPY . /usr/src/phylozoom_frontend

# Install app dependencies
RUN npm install
RUN cd ./client; npm install

EXPOSE 8080

# defined in package.json
CMD [ "npm", "start" ]
