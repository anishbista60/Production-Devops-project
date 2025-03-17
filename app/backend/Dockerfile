# Build stage
FROM cgr.dev/chainguard/go AS builder
WORKDIR /app

# Copy source code
COPY . .

# Detect system architecture dynamically and build accordingly
ARG TARGETOS=linux
ARG TARGETARCH=amd64
RUN CGO_ENABLED=0 GOOS=$TARGETOS GOARCH=$TARGETARCH go build -o backend .

# Ensure the binary is executable
RUN chmod +x backend

# Runtime stage (minimal final image)
FROM cgr.dev/chainguard/glibc-dynamic
WORKDIR /app

# Copy only the compiled binary
COPY --from=builder /app/backend /app/backend

# Ensure correct entrypoint
ENTRYPOINT ["/app/backend"]
