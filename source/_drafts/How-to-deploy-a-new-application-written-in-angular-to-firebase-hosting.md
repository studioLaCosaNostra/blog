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

Install firebase tools.

`npm install -g firebase-tools`

Login to firebase via cli.

`firebase login`

Init firebase configuration in project directory

`firebase init`

it should create files

add the `.firebase` directory to the `.gitignore` file

```gitignore
...
# Firebase
/.firebase
```

If you accidentally added this directory to the git, then you can remove it from the repository: `git rm -r --cached .firebase`
