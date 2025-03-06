# Stage 1: Build the React App
FROM cgr.dev/chainguard/node AS build
WORKDIR /app

# Since the user is non-root, change the owner to execute copy command
COPY --chown=node:node package.json package-lock.json ./

RUN npm install --frozen-lockfile
COPY --chown=node:node . .
RUN npm run build


# Stage 2: Serve with nginx alpine image
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]