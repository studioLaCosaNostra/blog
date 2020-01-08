---
title: How to speed up Android Gradle build in continuous integration
ampSettings:
  titleImage:
    path: null
tags:
  - automation
  - concourse ci
  - android
  - gradle
  - cordova
thumbnail:
---

```yml
---
platform: linux

image_resource:
  type: docker-image
  source:
    repository: alvrme/alpine-android
    tag: android-28

inputs:
  - name: app-repo

run:
  path: app-repo/ci/tasks/build_android.sh

caches:
  - path: .gradle
```

```sh
#!/bin/sh

set -eux

export ROOT_FOLDER=$(pwd)
export GRADLE_USER_HOME="${ROOT_FOLDER}/.gradle"

cd app-repo

./gradlew assembleDebug
```