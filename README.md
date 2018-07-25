# PhyloZoom

[![Travis](https://img.shields.io/travis/bcbi/phylozoom-frontend.svg?style=flat-square)](https://travis-ci.org/bcbi/phylozoom-frontend)
[![License](https://img.shields.io/badge/license-MIT-orange.svg?style=flat-square)](https://github.com/bcbi/phylozoom-frontend/blob/master/LICENSE)
[![Docker](https://img.shields.io/badge/docker-latest-magenta.svg?style=flat-square)](https://hub.docker.com/r/fernandogelin/phylozoom-frontend/)
## Overview

Front-end for PhyloZoom web application. Built with [d3.js](https://d3js.org/) and [phylotree.js](https://github.com/veg/phylotree.js/tree/master).

## Requirements

- [Node](https://nodejs.org/en/)
- [NPM](https://nodejs.org/en/)

## Install Dependencies

```bash
npm install
```

## Local Development

Run the following commands in separate terminals to start the local server and
watch files for changes:

```bash
npm start
# navigate to
localhost:8080/app
```

## Using Docker

```bash
docker pull bcbi/phylozoom-frontend
docker run -p 8080:8080 bcbi/phylozoom-frontend
```

## Or to run the web application with the backend:
```bash
docker-compose up
```
And navigate to `localhost:8080` on your browser.
