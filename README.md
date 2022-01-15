# tidi

Meet tidi, the `2kb` bubble chat component for any website... made using preact.

![screen](./readme-resources/size.png)

## Requirements

- node/npm
- golang
- Docker (optional for the prod)

## CLI Commands

### Front End

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# Optional build npm ready bundles to be consumed by other Preact web apps
npm run build:widget

# Optional build npm ready bundles to be used as a component library
npm run build:lib

# run tests with jest and enzyme
npm run test
```

### Back End

```bash
# Start the backend app
cd ./backend
go run main.go
```

## Author

- [darker](https://github.com/sanix-darker)
