# Stage 1
# Create image based on the official Node 8 image from dockerhub

FROM node:8.16.0-alpine as node

# Change directory so that our commands run inside this new directory

WORKDIR /app

# Copy dependency definitions

COPY package*.json /app/

# Install dependecies

RUN npm install

# Get all the code needed to run the app

COPY ./ /app/

# Run the angular in product
RUN npm run build -- --output-path=./dist/out --prod

# Stage 2
FROM nginx:1.15.2-alpine

#copy dist content to html nginx folder, config nginx to point in index.html
EXPOSE 4000

COPY ./default.conf /etc/nginx/conf.d/default.conf

COPY --from=node /app/dist/out /usr/share/nginx/html

