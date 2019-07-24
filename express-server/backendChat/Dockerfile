 # Create image based on the official Node 6 image from the dockerhub
FROM node:8.16.0
# Change directory so that our commands run inside this new directory

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app
# Copy dependency definitions
COPY package.json ./
# Install dependecies
RUN npm install
# Get all the code needed to run the app
COPY . ./
# Expose the port the app runs in
EXPOSE 5000
# Serve the app
CMD ["npm", "start"]