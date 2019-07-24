---
title: Cordova - Setup Android SDK on Ubuntu
ampSettings:
  titleImage:
    path: null
tags:
- cordova
- android
thumbnail:
---

`.bashrc`
```bash
export ANDROID_HOME=~/Downloads/sdk-tools-linux-4333796/
export JAVA_HOME=/usr/lib/jvm/jdk1.8.0_221/
export PATH=${PATH}:${ANDROID_HOME}/platform-tools:${ANDROID_HOME}/tools:${ANDROID_HOME}/tools/bin
```

```
source ~/.bashrc
```

```bash
sdkmanager --install tools
sdkmanager --install platform-tools
sdkmanager --install "build-tools;26.0.0"
sdkmanager --install "platforms;android-26" 
```