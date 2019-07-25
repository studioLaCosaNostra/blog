---
title: Cordova - Setup Android SDK on Ubuntu
ampSettings:
  titleImage:
    path: null
tags:
- cordova
- android
- java
- ubuntu
thumbnail:
---

1. Download the latest Android SDK version and save to `~/Downloads`
[https://developer.android.com/studio/index.html#command-tools](https://developer.android.com/studio/index.html#command-tools)
2. Extract Android SDK

```bash
unzip -d ~/Downloads/sdk-tools-linux ~/Downloads/sdk-tools-linux-*.zip
```

3. Download the latest Java JDK 8 from Oracle
[https://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html](https://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)
4. Create `/usr/lib/jvm`
```bash
sudo mkdir /usr/lib/jvm
```
5. Go to `/usr/lib/jvm`
```bash
cd /usr/lib/jvm
```
6. Extract JDK
```bash
sudo tar -xvzf ~/Downloads/jdk-8u221-linux-x64.tar.gz
```
According to this command, the JDK filename is jdk-8u221-linux-x64.tar.gz and which is located in the ~/Downloads folder. If your downloaded file is in any other location, change the command according to your path.

7. Update java locations in Ubuntu

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

8. Check updated locations

```bash
update-alternatives --list java
```

```bash
update-alternatives --list javac
```

9. Check java version

```bash
java -version
```

10. Edit `.bashrc`

```bash
export ANDROID_SDK_ROOT=~/Downloads/sdk-tools-linux/
export JAVA_HOME=/usr/lib/jvm/jdk1.8.0_221/
export PATH=${PATH}:${ANDROID_HOME}/platform-tools:${ANDROID_HOME}/tools:${ANDROID_HOME}/tools/bin
export GRADLE_HOME=/opt/gradle/gradle-5.0
export PATH=${GRADLE_HOME}/bin:${PATH}
```

11. Load new `.bashrc`

```bash
source ~/.bashrc
```

12. Accept all Android SDK licences.

```bash
yes | sdkmanager --licenses
```

13. Install the required dependencies for cordova android.

```bash
sdkmanager --install tools
sdkmanager --install platform-tools
sdkmanager --install "build-tools;26.0.0"
sdkmanager --install "platforms;android-26" 
```

14. Install gradle

```bash
wget https://services.gradle.org/distributions/gradle-5.0-bin.zip -P /tmp
```

```bash
sudo unzip -d /opt/gradle /tmp/gradle-*.zip
```