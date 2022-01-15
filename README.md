# tidi

Meet tidi, the `2kb` bubble chat component for any website... made using preact, running with a 9MB compiled backend service.

![screen](./readme-resources/size.png)

## Requirements

- node/npm
- go
- Docker (optional for the prod)

## CLI Commands

### Back End

#### Prod

```bash
# start the docker container
cd backend && make docker-run
```

### Dev

```bash
# Start the backend app
cd ./backend && make run
```

### Front End

#### Prod

```bash
# some cleans 
# build npm ready bundles to be consumed by other Preact web apps
# copy the final.html from source to dist
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
