# Build stage
FROM cgr.dev/chainguard/go AS builder
WORKDIR /app

# Copy source code and build binary
COPY . .
RUN go build -o backend .

# Runtime stage (minimal final image)
FROM cgr.dev/chainguard/glibc-dynamic
WORKDIR /app

# Copy only the compiled binary from builder stage
COPY --from=builder /app/backend /app/backend

# Run the application
CMD ["/app/backend"]
