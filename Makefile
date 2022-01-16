build-dist:
	npm install
	npm run build:widget
	rm -rf ./dist/index.js* ./dist/index.css.map ./dist/index.modern.js* ./dist/index.umd.js* ./dist/index.module.js.map
	cp ./src/final.html ./dist/index.html
	# For extensions
	cp ./src/component.html ./xtensions/chrome/component.html
	cp ./dist/index.module.js ./xtensions/chrome/index.module.js
	cp ./src/component.css ./xtensions/chrome/index.css
