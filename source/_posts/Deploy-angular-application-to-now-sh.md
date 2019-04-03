---
title: Deploy angular application to now.sh
ampSettings:
  titleImage:
    path: title-image.png
tags:
  - now.sh
  - angular
thumbnail: title-image.png
---

Angular is a platform for building applications across all platforms; web, mobile web, native mobile, and native desktop.
Below I show the steps needed for your application to be on `now.sh`

*For the purpose of writing this post, the configuration files were extracted from the working application https://qr-code-generator.now.sh*

Create `./now.json`

```json
{
  "version": 2,
  "name": "qr-code-generator",
  "alias": "qr-code-generator",
  "routes": [
    {
      "src": "/(assets/.+|.+\\.css|.+\\.js)",
      "headers": {
        "cache-control": "max-age=31536000,immutable"
      },
      "dest": "/$1"
    },
    {
      "src": "/(.*).html",
      "headers": {
        "cache-control": "public,max-age=0,must-revalidate"
      },
      "dest": "/$1.html"
    },
    {
      "src": "/(.*).json",
      "headers": {
        "cache-control": "public,max-age=0,must-revalidate"
      },
      "dest": "/$1.json"
    },
    {
      "src": "/(.*)",
      "headers": {
        "cache-control": "public,max-age=0,must-revalidate"
      },
      "dest": "/index.html"
    }
  ]
}
```

`version` means **Now** version, now the latest version has number 2.

`alias` is the production name of the project.

In `routes`, you can declare how the server should respond to request. In this case, it was important for us to add an asset cache. We set the maximum possible value, i.e. only 1 year because angular generates fingerprint to each file separately and appends to the file name (each new build creates a new fingerprint).

in `package.json` add two commands

```json
{
  "scripts": {
    "now-build": "ng build --prod",
    "now-deploy": "now ./dist -A ../now.json --target production"
  }
}

```

<script id="asciicast-238545" src="https://asciinema.org/a/238545.js" async></script>

Additionally, I added the new configuration to angular.json and calls it via the flag `--configuration=now`

`angular.json`

```json
"configurations": {
  "now": {
    "baseHref": "/",
    "deployUrl": "/",
    "fileReplacements": [
      {
        "replace": "src/environments/environment.ts",
        "with": "src/environments/environment.prod.ts"
      }
    ],
    "optimization": true,
    "outputHashing": "all",
    "sourceMap": false,
    "extractCss": true,
    "namedChunks": false,
    "aot": true,
    "extractLicenses": true,
    "vendorChunk": false,
    "buildOptimizer": true,
    "budgets": [
      {
        "type": "initial",
        "maximumWarning": "2mb",
        "maximumError": "5mb"
      }
    ],
    "serviceWorker": true,
    "ngswConfigPath": "src/ngsw-config.json"
  }  
}
```

Just because I already have one configuration for github pages and I needed another `baseHref` and `deployUrl`.