# Build stage
FROM node:20 AS build
WORKDIR /FrontEnd
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serveur statique
FROM nginx:alpine
COPY --from=build /FrontEnd/dist /usr/share/nginx/html
EXPOSE 80