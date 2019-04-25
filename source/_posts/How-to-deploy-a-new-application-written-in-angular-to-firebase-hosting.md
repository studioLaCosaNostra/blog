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
  - hosting
thumbnail: title-image.png
date: 2019-04-25
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

<script id="asciicast-242689" src="https://asciinema.org/a/242689.js" async></script>

Login to firebase CLI.

`firebase login`

<script id="asciicast-242844" src="https://asciinema.org/a/242844.js" async></script>

When running a command, the command should open a browser window with a login view.

![Firebase cli sign access grant view in browser](firebase-cli-sign-in-access.png)

After correct login, this message should appear.

![Firebase clis sign in success](firebase-cli-success-sign-in.png)

Init firebase configuration in project directory

`firebase init`

<script id="asciicast-242870" src="https://asciinema.org/a/242870.js" async></script>

It should create `firebase.json` and `dist` folder:

```
master@master-Lenovo-B50-80:~/workspace/test-firebase$ tree -L 1 -a
.
├── angular.json
├── dist
├── e2e
├── .editorconfig
├── firebase.json
├── .firebaserc
├── .git
├── .gitignore
├── node_modules
├── package.json
├── package-lock.json
├── README.md
├── src
├── tsconfig.json
└── tslint.json
```

Add the `.firebase` directory to the `.gitignore` file

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
    "public": "dist/test-firebase",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ]
  }
}
```

Link to the full `firebase.json` configuration 
https://firebase.google.com/docs/hosting/full-config
You can read about the full possibilities of this configuration. The basic configuration is used in this guide.

Build angular app with production environment and AOT.

`ng build --prod`

<script id="asciicast-242867" src="https://asciinema.org/a/242867.js" async></script>

Upload app to firebase hosting.

`firebase deploy`

<script id="asciicast-242872" src="https://asciinema.org/a/242872.js" async></script>

Now we can see our application on the internet 
https://test-firebase-14dbe.firebaseapp.com/ :)

![Test firebase angular application view](test-firebase-page-view.png)

That's all, if some stage is unclear then please describe why below in the comments.