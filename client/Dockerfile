# Stage 1: Build the React app
FROM node:20-alpine AS build

WORKDIR /app

# First copy only package files for better caching
COPY package.json .
COPY yarn.lock ./

RUN yarn install

# Then copy all other files
COPY . .

RUN yarn build

# Stage 2: Serve with Nginx
FROM nginx:1.21-alpine

# Remove default nginx config
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]