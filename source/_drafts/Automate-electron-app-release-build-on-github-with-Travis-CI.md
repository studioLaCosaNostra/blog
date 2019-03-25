---
title: Automate electron app release build on github with Travis CI
ampSettings:
  titleImage:
    path: null
tags:
thumbnail:
---

Kontynując pracę nad projektem QR Code Generator zauważyłem że dużo czasu poświęcam na lokalnym budowaniu aplikacji na swoim komputerze. Dodatkowo nie mogłem zbudować wersji na mac'a bez maca (pracuję na ubuntu). Pomocny okazał się Travis CI, który ma w sobie gotowy obraz osx do automatycznego testowania i budowania projektów. Wystarczyło napisać skrypt konfiguracyjny dla niego i gotowe. Teraz przy commitowaniu na mastera travis automatycznie testuje aplikację, oraz jeśli dodałeś do commita tag z nowym numerem wersji wykonują się dodatkowe etapy wdrożenia aplikacji na platformy Windows, Mac, Linux i wrzucone zostaną są jako draft do github release.

```yml
sudo: false

language: node_js
node_js: "9.11.1"

before_install:
  - cd app

cache:
  directories:
    - node_modules
    - app/node_modules
    - $HOME/.cache/electron
    - $HOME/.cache/electron-builder
    - $HOME/.npm/_prebuilds

env:
  global:
    - ELECTRON_CACHE=$HOME/.cache/electron
    - ELECTRON_BUILDER_CACHE=$HOME/.cache/electron-builder

jobs:
  include:
    - stage: Test
      script:
        - npm test
    - stage: Deploy Windows & Mac
      if: tag IS present
      os: osx
      osx_image: xcode10.1
      script:
        - npm run release -- --mac --win
      before_cache:
        - rm -rf $HOME/.cache/electron-builder/wine
    - stage: Deploy linux
      if: tag IS present
      os: linux
      dist: trusty
      script:
        - npm run release
```


Travis ma wbudowany system cachowania projektu, wystarczy podać ścieżki do katalogów które chcemy zachować po wykonaniu każdego etapu pliku konfiguracyjnego.
Skrypt `npm run release` to tak naprawdę `electron-builder -p always`, komenda automatycznie wysyła build na github release. Dodając flagę `--mac` buduje projekt dla OSX. Flaga `--win` buduje projekt dla Windowsa. Budowanie dla Windowsa zostało wykonane na OSX ponieważ tam jest zautomatyzowana instalacja `wine` potrzebnego do edycji `.exe`.

Aby projekt został wysłany na *github release page* potrzebne jest dodanie zmiennej `GH_TOKEN` w konfiguracji travisa.
![Environment Variables of Travis settings view](Automate-electron-app-release-build-on-github-with-Travis-CI/travis-env-settings.png)
Dodając zmienną bądź pewny że nie masz zaznaczonego **Display value in build log**, logi travisa są dostępny przez internet, więc każdy może wykraść klucz jeśli wie gdzie szukać i jest on widoczny.

Teraz jeśli masz gotowy taką konfigurację w projekcie travis będzie sam za ciebie wykonywał testy, a robiąc `git tag -a v1.0.1 -m "v1.0.1" && git push origin --tags` travis rozpocznie dodatkowo budowanie release aplikacji i wyśle na `github release page`.