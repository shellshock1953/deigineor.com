# Apora Music

A simple portfolio website for a friend's EDM project.

https://aporamusic.com

## Setup

    $ yarn install

## Build

This script will build the assets in the `build/` folder.

    $ bin/build

You can automate builds on file changes using [fsevent_watch](https://github.com/proger/fsevent_watch)

    $ fsevent_watch -F ./views/ ./css/ ./img/ | xargs -I% bin/build

## Deploy

This script will rebuild and sync the `build/` folder to the s3 bucket:

    $ bin/deploy

## Update content

The views are built based on the content in the [build.yml](https://github.com/yannvanhalewyn/apora-music/blob/master/build.yml) file (releases, contact info, SEO etc..)
