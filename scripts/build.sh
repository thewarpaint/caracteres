#!/usr/bin/env bash

export CURRENT_SHA="$(git log --pretty=format:'%h' -n 1)"

# Add fingerprinting to CSS and JS files
sed -i -e "s/assets\/main.css/assets\/main-$CURRENT_SHA.css/g" \
  index.html _includes/character.html chocolate.html \
  tshirt-chocolate.html tshirt-desenrascanco.html tshirt-ñañaras.html
sed -i -e "s/assets\/main.js/assets\/main-$CURRENT_SHA.js/g" _includes/character.html

# Add build SHA to templates
sed -i -e "s/%CURRENT_SHA%/$CURRENT_SHA/g" chocolate.html

# Build Jekyll site
git checkout -B tmp
rm -rf _site
bundle exec jekyll build

# Compile SASS assets, rename CSS output files and copy them to _site dir
sass --style compressed assets/main.scss "assets/main-$CURRENT_SHA.css"
cp assets/*.css* _site/assets

# Rename JS files and copy them to _site dir
cp assets/main.js "_site/assets/main-$CURRENT_SHA.js"
