---
title: Prerender angular application - generate static pages
ampSettings:
  titleImage:
    path: title-image.png
tags:
  - angular
  - prerender
  - universal
thumbnail: title-image.png
date: 2019-11-18
---

**Build an SEO friendly website without server-side rendering.**
<!--more-->

From the very beginning of Angular 2, there was a capability to generate HTML content of the application on the server-side. Without this, bots search engines simply are not able to see what is on the site without the interpretation of javascript very few bots will improve. But what if you don’t have a server with node.js and you want to be visible? Prerender subpages may help in this case. In previous versions of Angular Universal, there is an example of how to do this [link to prerender.ts in universal-starter archive](https://github.com/angular/universal-starter/blob/master/prerender.ts). Some time has passed and angular universal has officially become part of the Angular ecosystem, but unfortunately, there is no example of how to make prerender code anywhere.
Today I present an example of how I solved it in my project trying to minimize the interference in the generated nguniversal code.

First of all, you need to add angular universal to your project with this command from [server-side rendering guide](https://angular.io/guide/universal)

```bash
ng add @nguniversal/express-engine --clientProject project-example
```

It will generate all the scripts to run server-side rendering in our application. You need it to generate static pages.

The next step is to transfer the code fragments responsible for creating the express server from `server.ts` to a new `express-app.ts` file. Below is the code that you should paste into the new file.

`express-app.ts`

```ts
import 'zone.js/dist/zone-node';

import * as express from 'express';
import { join } from 'path';

// Express server
export const app = express();

const DIST_FOLDER = join(process.cwd(), 'dist/browser');

// * NOTE :: leave this as require() since this file is built Dynamically from webpack
const {AppServerModuleNgFactory, LAZY_MODULE_MAP, ngExpressEngine, provideModuleMap} = require('./dist/server/main');

// Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
app.engine('html', ngExpressEngine({
  bootstrap: AppServerModuleNgFactory,
  providers: [
    provideModuleMap(LAZY_MODULE_MAP)
  ]
}));

app.set('view engine', 'html');
app.set('views', DIST_FOLDER);

// Example Express Rest API endpoints
// app.get('/api/**', (req, res) => { });
// Serve static files from /browser
app.get('*.*', express.static(DIST_FOLDER, {
  maxAge: '1y'
}));

// All regular routes use the Universal engine
app.get('*', (req, res) => {
  res.render('index', { req });
});
```

Then remove the express server code from the `server.ts` and instead import it from the `express-app.ts` leaving only the code listening to the port.

`server.ts`

```ts
import { app } from './express-app';

const PORT = process.env.PORT || 4000;

// Start up the Node server
app.listen(PORT, async () => {
  console.log(`Node Express server listening on http://localhost:${PORT}`);
});
```

Now add the main code that performs prerender of our subpages. (you also need to install additional library to create subfolders `npm install mkdirp @types/mkdirp`)

`prerender.ts`

```ts
import * as request from 'request-promise';
import * as mkdirp from 'mkdirp';
import { promisify } from 'util';
import { writeFileSync } from 'fs';
import { Express } from 'express';

import { app } from './express-app';

export const ROUTES = [
  '/',
  '/auth',
  '/privacy-policy'
];

const mkdirpAsync = promisify(mkdirp);

function prerender(expressApp: Express, routes: string[]) {
  const PORT = process.env.PRERENDER_PORT || 4000;
  // Start up the Node server
  const server = expressApp.listen(PORT, async () => {
    try {
      for (const route of routes) {
        const result = await request.get(`http://localhost:${PORT}${route}`);
        await mkdirpAsync(`dist/browser${route}`);
        writeFileSync(`dist/browser${route}/index.html`, result);
      }
      console.log('Prerender complete.');
      server.close();
    } catch (error) {
      server.close(() => process.exit(1));
    }
  });
}

prerender(app, ROUTES);

```

Now add the main code that performs prerender of our subpages. (you also need to install additional library to create subfolders `npm install mkdirp @types/mkdirp`)

```javascript
// Work around for https://github.com/angular/angular-cli/issues/7200

const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'none',
  entry: {
    // This is our Express server for Dynamic universal
    server: './server.ts',
    prerender: './prerender.ts' // <--------------- HERE!!!
  },
  externals: {
    './dist/server/main': 'require("./server/main")'
  },
  target: 'node',
  resolve: { extensions: ['.ts', '.js'] },
  optimization: {
    minimize: false
  },
  output: {
    // Puts the output at the root of the dist folder
    path: path.join(__dirname, 'dist'),
    filename: '[name].js'
  },
  module: {
    noParse: /polyfills-.*\.js/,
    rules: [
      { test: /\.ts$/, loader: 'ts-loader' },
      {
        // Mark files inside `@angular/core` as using SystemJS style dynamic imports.
        // Removing this will cause deprecation warnings to appear.
        test: /(\\|\/)@angular(\\|\/)core(\\|\/).+\.js$/,
        parser: { system: true }
      }
    ]
  },
  plugins: [
    new webpack.ContextReplacementPlugin(
      // fixes WARNING Critical dependency: the request of a dependency is an expression
      /(.+)?angular(\\|\/)core(.+)?/,
      path.join(__dirname, 'src'), // location of your src
      {} // a map of your routes
    ),
    new webpack.ContextReplacementPlugin(
      // fixes WARNING Critical dependency: the request of a dependency is an expression
      /(.+)?express(\\|\/)(.+)?/,
      path.join(__dirname, 'src'),
      {}
    )
  ]
};

```

Add a new script to `package.json` for ease of use.

```json

"scripts": {
  ...
  "prerender": "node dist/prerender",
  ...
}

```

And that's all, now you just need to build an application in SSR mode and run the command prerender.

```bash
npm run build:ssr && npm run prerender
```

In the `dist/browser` directory, you will find subfolders with `index.html` files containing SEO-friendly generated HTML content of the application.

If you are using @angular/service-worker then you will need to reconfigure right after the `prerender` because the checksum value in the index.html file has changed after the html modification.

```bash
ngsw-config dist/browser ngsw-config.json
```

An example of a working page on this solution is my second [programming blog](https://rayros.github.io/).

Prerender in Angular 9 has an error on the production build.

https://github.com/angular/angular-cli/issues/17021

When they solve the problem, I will probably update the post to keep it up to date with the latest Angular.
