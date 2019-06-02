---
title: How to automate iOS application submission process with puppeteer
ampSettings:
  titleImage:
    path: title-image.png
tags:
  - puppeteer
  - node.js
  - app store
  - apple
thumbnail: title-image.png
---

Create project directory.
`mkdir app-store-submission-cli`
Go to project directory.
`cd app-store-submission-cli`
Initialize npm package.
`npm init`
Install required puppeteer, debug log, semver and minimist.
`npm i puppeteer debug semver minimist`
Install also typescript transpiler and types for libs.
`npm i typescript @types/puppeteer @types/debug @types/semver @types/minimist --save-dev`
Install also google typescript style helpers.
`npx gts init`
Create source code dir
`mkdir src`
Init index.ts
`touch src/index.ts`

Add to package.json start script.

```json
{
  "scripts": {
    "start": "node build/src/index.js"
  }
}
```

Add to tsconfig.json *dom* lib for puppeteer types check
```json
{
  "compilerOptions": {
    "lib": ["dom"]
  }
}
```