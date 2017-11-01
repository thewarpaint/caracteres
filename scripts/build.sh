#!/usr/bin/env bash

export CURRENT_SHA="$(git log --pretty=format:'%h' -n 1)"

sed -i -e "s/assets\/main.css/assets\/main-$CURRENT_SHA.css/g" index.html _includes/character.html

git checkout -B tmp
rm -rf _site
bundle exec jekyll build

sass --style compressed assets/main.scss "assets/main-$CURRENT_SHA.css"
cp assets/*.css* _site/assets
