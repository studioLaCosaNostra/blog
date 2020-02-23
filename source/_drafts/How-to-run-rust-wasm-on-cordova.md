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
---

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