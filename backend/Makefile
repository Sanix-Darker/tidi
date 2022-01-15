docker-build:
	docker build --no-cache -t sanixdarker/tidi-backend:latest -f Dockerfile .

docker-run:
	docker run -it --rm -p 1324:1324 sanixdarker/tidi-backend:latest

run:
	go run main.go

build:
	go build -o ./tidi

exec: build
	./tidi
