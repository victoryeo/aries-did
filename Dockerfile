#   Use an official Node.js runtime as a parent image
#FROM node:20.8.0-alpine as BUILD_IMAGE
#FROM node:18-bullseye-slim 
FROM node:18.13-alpine

# Install Python, pkg-config, and other dependencies
#RUN apt-get update -y
#RUN apt-get install -y python3 make gcc g++
RUN apk add --no-cache  build-base python3

#   Set the working directory in the container
WORKDIR /app

#   Copy package.json and package-lock.json to the working directory
COPY package*.json ./

#   Install project dependencies
RUN npm install ffi-napi
RUN npm i

#   Copy the rest of the application code to the container
COPY . .

#   Expose the port your React app runs on
EXPOSE 3000
EXPOSE 3001
EXPOSE 3002

#   Run application
CMD ["/bin/sh","entrypoint.sh"]
