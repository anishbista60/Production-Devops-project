# Stage 1: Build the React App
FROM cgr.dev/chainguard/node AS build
WORKDIR /app

# Since the user is non-root, change the owner to execute copy command
COPY --chown=node:node package.json package-lock.json ./

RUN npm install --frozen-lockfile
COPY --chown=node:node . .
RUN npm run build

# Stage 2: Serve the React App with Nginx
FROM nginx:alpine

# Copy the build output from the build stage to the nginx container
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80


CMD ["nginx", "-g", "daemon off;"]
