---
title: Cordova - Setup Android SDK on Ubuntu
ampSettings:
  titleImage:
    path: title-image.png
tags:
- cordova
- android
- java
- ubuntu
thumbnail: title-image.png
date: 2019-07-29
---
If you're looking for a simple instruction on how to run Cordova project for the first time on an Android system, you've just found it.
<!-- more -->

Below I describe the steps to be taken to start building an Android project in Cordova on a clean Ubuntu instance.

## Download the latest Android SDK

[Download Android SDK command tools](https://developer.android.com/studio/index.html#command-tools)

## Extract Android SDK

```bash
unzip -d ~/Downloads/sdk-tools-linux ~/Downloads/sdk-tools-linux-*.zip
```

## Download the latest Java JDK 8 from Oracle

[Download JAVA JDK 8](https://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)

## Create `/usr/lib/jvm`

```bash
sudo mkdir /usr/lib/jvm
```

## Go to `/usr/lib/jvm`

```bash
cd /usr/lib/jvm
```

## Extract JDK

```bash
sudo tar -xvzf ~/Downloads/jdk-8u221-linux-x64.tar.gz
```

## Update java locations in Ubuntu

```bash
sudo update-alternatives --install "/usr/bin/java" "java" "/usr/lib/jvm/jdk1.8.0_221/bin/java" 0
```

```bash
sudo update-alternatives --install "/usr/bin/javac" "javac" "/usr/lib/jvm/jdk1.8.0_221/bin/javac" 0
```

```bash
sudo update-alternatives --set java /usr/lib/jvm/jdk1.8.0_221/bin/java
```

```bash
sudo update-alternatives --set javac /usr/lib/jvm/jdk1.8.0_221/bin/javac
```

## Check updated locations

```bash
update-alternatives --list java
```

```bash
update-alternatives --list javac
```

## Check java version

```bash
java -version
```

## Edit `.bashrc`

```bash
export ANDROID_SDK_ROOT=~/Downloads/sdk-tools-linux/
export JAVA_HOME=/usr/lib/jvm/jdk1.8.0_221/
export PATH=${PATH}:${ANDROID_HOME}/platform-tools:${ANDROID_HOME}/tools:${ANDROID_HOME}/tools/bin
export GRADLE_HOME=/opt/gradle/gradle-5.0
export PATH=${GRADLE_HOME}/bin:${PATH}
```

## Load new `.bashrc`

```bash
source ~/.bashrc
```

## Accept all Android SDK licences

```bash
yes | sdkmanager --licenses
```

## Install the required dependencies for cordova android

```bash
sdkmanager --install tools
sdkmanager --install platform-tools
sdkmanager --install "build-tools;26.0.0"
sdkmanager --install "platforms;android-26" 
```

## Install gradle

```bash
wget https://services.gradle.org/distributions/gradle-5.0-bin.zip -P /tmp
```

```bash
sudo unzip -d /opt/gradle /tmp/gradle-*.zip
```

## Run cordova android

Now the command

```bash
cordova run android
```

in your project will be done without any problems.
