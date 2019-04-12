---
title: How to deploy a new application written in angular to firebase hosting
ampSettings:
  titleImage:
    path: title-image.png
tags:
  - angular
  - firebase
  - git
  - npm
thumbnail: title-image.png
---

Add project in firebase console

`ng new test-firebase`

ascii rec

Install firebase tools.

`npm install -g firebase-tools`

ascii rec

Login to firebase via cli.

`firebase login`

youtube video

Init firebase configuration in project directory

`firebase init`

ascii rec

it should create files:

`files tree`

add the `.firebase` directory to the `.gitignore` file

```gitignore
...
# Firebase
/.firebase
```

    If you accidentally added this directory to the git, then you can remove it from the repository: `git rm -r --cached .firebase`

In firebase.json you should have something like this.

```
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ]
  }
}
```

Link do pełnej konfguracji `firebase.json` https://firebase.google.com/docs/hosting/full-config
Można przeczytać o pełnych możliwościach tej konfiguracji. W tym poradniku użyta jest podstawowa konfiguracja.

Build angular app with production environment and AOT.

`ng build --prod`

Upload app to firebase hosting.

`firebase deploy`

