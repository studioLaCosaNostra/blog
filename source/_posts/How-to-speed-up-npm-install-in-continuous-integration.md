---
title: How to speed up npm install in continuous integration
ampSettings:
  titleImage:
    path: title-image.png
tags:
  - automation
  - concourse ci
  - npm
  - nodejs
thumbnail: title-image.png
date: 2020-01-07 16:00:00
---

Generally I started playing with Concourse CI for a few days and found it to be a great server for automation for my private projects. In this post I will describe how to speed up `npm install`.

Concourse has a built-in directory caching system from our workspace. Just add directories to the task configuration in the `caches:` field.

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

In our case it will be the `.npm` and `node_modules` directory. By default, `npm` stores the cache in `~/.npm` which for Concourse means `/root/.npm`. And here a problem arises, because Concourse can only cache files and folders from a workspace that may have a different path e.g: `/tmp/23f2d2/build/`. 
Below is an example script with a changed cache path to `/tmp/23f2d2/build/.npm`.

`build.sh`

```sh
#!/bin/sh

set -eux

npm config set cache $(pwd)/.npm --global

npm install -g npm

cd game-repo

npm install --unsafe-perm
npm run build
```

After such an operation, we can be sure that the next tasks will have the preserved packages from previous builds.