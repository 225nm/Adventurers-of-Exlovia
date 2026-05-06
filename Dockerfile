ARG NODE_VERSION=20.17.0

# Base stage
FROM node:${NODE_VERSION}-alpine AS base

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

# Dev stage
FROM base as development
RUN npm install
COPY . .
EXPOSE 8081
CMD ["npm", "run", "dev", "--", "--host"]

# Dependencies stage
FROM base as deps
RUN npm ci
COPY . .
RUN npm run build

# Production stage with nginx
FROM nginx:alpine as production
COPY --from=deps /usr/src/app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]