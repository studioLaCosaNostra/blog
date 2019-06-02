---
title: How to automate iOS application submission process with puppeteer
ampSettings:
  titleImage:
    path: null
tags:
thumbnail:
---

`mkdir app-store-submission-cli`
`cd app-store-submission-cli`
`npm init`
`npm i puppeteer debug semver`
`npm i typescript @types/puppeteer @types/debug @types/semver @types/minimist --save-dev`
`npx gts init`
`mkdir src`
`touch src/index.ts`

add to package.json
```json
{
  "scripts": {
    "start": "node build/src/index.js"
  }
}
```

add to tsconfig.json *dom* lib for puppeteer types check
```json
{
  "compilerOptions": {
    "lib": ["dom"]
  }
}
```