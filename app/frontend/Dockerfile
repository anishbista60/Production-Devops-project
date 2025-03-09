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

# Copy the build output to replace the default nginx contents
COPY --from=build /app/build /usr/share/nginx/html

# Create entrypoint script as a separate step to ensure it exists
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo '# Replace API URL in the already-built app' >> /docker-entrypoint.sh && \
    echo 'find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|http://localhost:8080|${REACT_APP_API_URL}|g" {} \\;' >> /docker-entrypoint.sh && \
    echo '# Start nginx' >> /docker-entrypoint.sh && \
    echo 'nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh && \
    # Verify the script exists and is executable
    ls -la /docker-entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]