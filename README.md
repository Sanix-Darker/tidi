# tidi

Meet tidi, the `2kb` bubble chat component for any website... made using preact, running with a `4MB` compiled backend service.

FrontEnd

![screen](./readme-resources/size.png)

Backend

![screen2](./readme-resources/size2.png)

## Disclaimer

I made this project for a specific need, that was a lite 'live chat' on some platform like twitter from the "twitter space" feature, the final idea was then to come up with a web extension that could allow chatting all over the internet with a single roomkey and an username, that's why the project was first called ttspch (standing for twitter space chat)... well.., i decided to change it due to the impossible pronounciation thing....

![demo](./readme-resources/demo.png)

## Requirements

- node/npm (for dev)
- go (for dev)
- Docker (for the prod)

## CLI Commands

The backend should be running first before the backend...

### Back End

The service is running on port `:1324`

#### Prod

```bash
# start the docker container
cd backend && make docker-run

# or using pm2 :
# cd backend
# pm2 start --name tidi-backend make -- docker-run
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
make build-dist

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
