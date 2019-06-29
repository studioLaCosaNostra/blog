---
title: How to debug Angular tests in VSCode
ampSettings:
  titleImage:
    path: title-image.png
tags:
  - angular
  - karma
  - unit tests
  - debugging
thumbnail: title-image.png
---

VSCode has the option of debugging code inside the editor. While in typical console programs running the debug is very easy, so on the Angular test environment which is Karma is not so easy, because here we have a browser as a test environment.

Fortunately, when looking for an answer, I discovered one source of microsoft [vscode-recipes](https://github.com/microsoft/vscode-recipes/tree/master/Angular-CLI). And by reading the description [vscode-chrome-debug](https://github.com/microsoft/vscode-chrome-debug) I was able to create a launcher of my dreams.

- Add the configuration to the file `.vscode/launch.json`

```json
{
  "type": "chrome",
  "request": "launch",
  "name": "Debug karma tests",
  "url": "http://localhost:9876/debug.html",
  "webRoot": "${workspaceFolder}",
  "runtimeArgs": [
    "--headless"
  ],
  "sourceMaps": true,
  "sourceMapPathOverrides": {
    "webpack:/*": "${webRoot}/*",
    "/./*": "${webRoot}/*",
    "/src/*": "${webRoot}/*",
    "/*": "*",
    "/./~/*": "${webRoot}/node_modules/*"
  },
  "port": 9223
}
```

Now all you have to do is run `ng test` in the background. And when you need to check what is happening in a given test, all you have to do is insert a breakpoint on a given line or add `debugger`, press F5 and you have everything you need.

PS: By pressing `CTRL + SHIFT + Y` you open the debug console where we can execute the code in the current breakpoint.
