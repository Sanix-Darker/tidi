# build executable binary
FROM golang:latest as builder

WORKDIR $GOPATH/src/github.com/d4rk3r/
# We only copy our app
COPY . app


WORKDIR $GOPATH/src/github.com/d4rk3r/app/
# We fetch dependencies
RUN go get -d -v

# We compile
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o /go/bin/tidi-backend

# Let's build our small image
FROM scratch

# Copy our static executable.
COPY --from=builder /go/bin/tidi-backend  /go/bin/tidi-backend

# Run the hello binary.
ENTRYPOINT ["/go/bin/tidi-backend"]

