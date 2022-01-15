build:
	npm run build:widget
	rm -rf ./dist/index.js* ./dist/index.css.map ./dist/index.modern.js* ./dist/index.umd.js* ./dist/index.module.js.map
	mv ./dist/index.module.js ./dist/index.mod.js
	cp ./src/final.html ./dist/index.html
