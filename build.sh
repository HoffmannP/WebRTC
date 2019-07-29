#!/bin/bash

uglifycss css/style.css > min/css/style.css
rollup -f cjs js/script.js > min/js/script.rollup.js
uglifyjs --compress --mangle -- min/js/script.rollup.js > min/js/script.js
html-inline -i index.html -o min/index.inline.html -b min
html-minifier --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-tag-whitespace --use-short-doctype min/index.inline.html > index.min.html