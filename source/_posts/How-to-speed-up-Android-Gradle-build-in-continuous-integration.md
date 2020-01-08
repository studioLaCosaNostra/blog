---
title: How to speed up Android Gradle build in continuous integration
ampSettings:
  titleImage:
    path: title-image.png
tags:
  - automation
  - concourse ci
  - android
  - gradle
thumbnail: title-image.png
date: 2020-01-08 16:00:00
---

Below is a sample task for Concourse CI, which caches `gradle` packages for future builds.

`build_android.sh`

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

`build.sh`

```sh
#!/bin/sh

set -eux

export ROOT_FOLDER=$(pwd)
export GRADLE_USER_HOME="${ROOT_FOLDER}/.gradle"

cd app-repo

./gradlew assembleDebug
```

At the beginning of shell script I set the path `GRADE_USER_HOME` to be relative to the currently used workspace, so that Concourse can save the files for later.