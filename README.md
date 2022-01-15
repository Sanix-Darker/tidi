# tidi

Meet tidi, the `2kb` bubble chat component for any website... made using preact, running with a `9MB` golang compiled backend service.

![screen](./readme-resources/size.png)

## DIsclaimer

I made this project for a specific need who is the need of lite 'live chat' on some platform twitter from a twitter space, the final idea was to come up with a web extension that could be allow to have the chat on any page with the right room.

## Requirements

- node/npm
- go
- Docker (optional for the prod)

## CLI Commands

### Back End

The service is running on port `:1324`

#### Prod

```bash
# start the docker container
cd backend && make docker-run
```

### Dev

```bash
# Start the backend app
cd backend && make run
```

### Front End

#### Prod

```bash
# some cleans 
# build npm ready bundles to be consumed by other Preact web apps
# copy the final.html from source to dist
# optional, because you can use the one from this repo directly...
make build

# then run de dist content using serve or http-server
cd dist && http-server
```

#### Dev

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev
```

## Author

- [darker](https://github.com/sanix-darker)
