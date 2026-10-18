FROM golang:1.21-alpine AS build
WORKDIR /app
COPY . .
RUN go build -o portfolio .

FROM alpine:latest
WORKDIR /app
COPY --from=build /app/portfolio /app/portfolio
EXPOSE 8080
ENV PORT=8080
CMD ["/app/portfolio"]
