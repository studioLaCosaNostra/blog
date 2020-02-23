---
title: How to run rust wasm on cordova
ampSettings:
  titleImage:
    path: title-image.png
tags:
  - rust
  - cordova
  - wasm
thumbnail: title-image.png
date: 2020-02-23
---

Creating a game in rust language I came across a problem with running it in Cordova. It turned out that the cargo web builder uses fetch api to download the wasm for the webassembly compiler, but cannot download from `file: //` in cordova.

![Chrome devtools fetch api file download error](fetch-error.png)

The search for a sensible solution ended with the creation of a script overwriting the action of fetch api, so that the application uses XHR, which can download `file: //`.

```html
 <body>
  <canvas id="canvas"></canvas>
  <script type="text/javascript" src="cordova.js"></script>
  <script>
    window.fetch = (url, info) => {
      return new Promise(function(resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open((info && info.method) || "GET", url);
        if (url.endsWith(".wasm")) xhr.responseType = "arraybuffer";

        xhr.onload = function() {
          if (this.status >= 200 && this.status < 300) {
            resolve({
              json: () => JSON.parse(xhr.response),
              ok: true,
              arrayBuffer: () => xhr.response
            });
          } else {
            reject({
              status: this.status,
              statusText: xhr.statusText
            });
          }
        };
        xhr.onerror = function() {
          reject({
            status: this.status,
            statusText: xhr.statusText
          });
        };
        xhr.send();
      });
    };
    WebAssembly.instantiateStreaming = undefined;
  </script>
  <script type="text/javascript" src="lines.js"></script>
</body>
```

The script should be added before importing the main application script.

Thanks to this solution, the Lines application is available in the Google Play Store.

https://play.google.com/store/apps/details?id=studiolacosanostra.game.lines
