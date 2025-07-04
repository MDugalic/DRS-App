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

# Install envsubst for template processing
RUN apk add --no-cache bash
RUN rm -rf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
# Copy the nginx config template
COPY nginx.conf /etc/nginx/templates/default.conf.template
EXPOSE $PORT
CMD ["nginx", "-g", "daemon off;"]

