#!/usr/bin/env bash

git checkout -B tmp
rm -rf _site
bundle exec jekyll build

sass --style compressed assets/main.scss assets/main.min.css
cp assets/main.min.css assets/main.min.css.map _site/assets
