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
  - firebase console
thumbnail: title-image.png
---

In this article, I describe how easy and simple you can share your angular application on firebase hosting without having advanced knowledge about servers and sharing websites on the web.

At the beginning, register on firebase console.

https://console.firebase.google.com

![Firebase console dashboard after login](firebase-console-login-dashboard.png)

Add new project.

![Firebase console add new project](firebase-console-add-new-project.png)

After creating the project, you should be moved to the project view.

![Firebase console project dashboard](firebase-console-project-dashboard-after-create.png)

After creating the project, we can start creating the angular project locally.

In the next step install the angular CLI and firebase tools.

`npm install -g @angular/cli`

<script id="asciicast-5Q8TMhb8bl1vXoaiFSoNTX8BW" src="https://asciinema.org/a/5Q8TMhb8bl1vXoaiFSoNTX8BW.js" async></script>

`npm install -g firebase-tools`

<script id="asciicast-242425" src="https://asciinema.org/a/242425.js" async></script>

Create a new angular project using the cli command.

`ng new test-firebase`

ascii rec



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

If you accidentally added this directory to the git, then you can remove it from the repository using this command: `git rm -r --cached .firebase`

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

