# https://blog.callr.tech/static-blog-hugo-docker-gitlab/
FROM node:16.20.0-alpine3.18 AS build

# Install Hugo
ADD https://github.com/gohugoio/hugo/releases/download/v0.111.3/hugo_0.111.3_Linux-64bit.tar.gz /hugo.tar.gz
RUN tar -zxvf hugo.tar.gz
RUN cp /hugo /bin/ && hugo version

# The source files are copied to /site
COPY . /site
WORKDIR /site

# And then we just run Hugo
RUN npm install

RUN npm run build

# stage 2
FROM nginx:1.15-alpine

WORKDIR /usr/share/nginx/html/

# Clean the default public folder
RUN rm -fr * .??*

# Copy rendered files
COPY --from=build /site/public /usr/share/nginx/html
