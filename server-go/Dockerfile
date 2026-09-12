FROM golang:1.24-alpine AS build
WORKDIR /src
COPY go.mod ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags='-s -w' -o /loancompare-api .

FROM alpine:3.22
RUN adduser -D -H appuser
WORKDIR /app
COPY --from=build /loancompare-api /app/loancompare-api
USER appuser
EXPOSE 4000
ENTRYPOINT ["/app/loancompare-api"]
