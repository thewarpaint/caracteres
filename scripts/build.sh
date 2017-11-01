#!/usr/bin/env bash

git checkout -B tmp
rm -rf _site
bundle exec jekyll build

sass --style compressed assets/main.scss assets/main.css
cp assets/main.css assets/main.css.map _site/assets
