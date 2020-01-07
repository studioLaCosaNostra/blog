---
title: How to speed up npm install in continuous integration
ampSettings:
  titleImage:
    path: null
tags:
thumbnail:
---

`build.yml`

```yml
---
platform: linux

image_resource:
  type: docker-image
  source: { repository: node, tag: 12 }

inputs:
  - name: game-repo

run:
  path: game-repo/ci/tasks/build.sh

caches:
  - path: .npm
  - path: game-repo/node_modules
```

```sh
#!/bin/sh

set -eux

npm config set cache $(pwd)/.npm --global

npm install -g npm

cd game-repo

npm install --unsafe-perm
npm run build
```