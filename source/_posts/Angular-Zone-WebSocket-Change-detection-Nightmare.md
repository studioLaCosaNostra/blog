---
title: 'Angular, Zone, WebSocket  === Change detection Nightmare'
ampSettings:
  titleImage:
    path: title-image.png
tags:
  - angular
  - zone.js
  - websocket
  - change detection
thumbnail: title-image.png
date: 2019-09-14
---

I got a task to make a working application for android & ios from the web application in two weeks. I agreed and the first thing I heard after putting it to the tests was that the application is terribly slow. By entering the Performance Monitor on the phone, the application actually pulled on average 90% of CPU consumption. After profiling Javascript Profiler, it turned out that 80% of operations go from WebSocket and interestingly everything in Angular Zone :). Here is a sample code of how to remove events from Websocket in zone.js according to README on github zone.js

**The following code will only work if it is attached before importing zone.js into the application.**

```typescript
global['__Zone_ignore_on_properties'] = [];

// disable on properties
// tslint:disable-next-line: typedef
const targets = [WebSocket];
targets.forEach((target) => {
  global['__Zone_ignore_on_properties'].push({
    target,
    ignoreProperties: ['close', 'error', 'open', 'message']
  });
});

// disable addEventListener
global['__zone_symbol__BLACK_LISTED_EVENTS'] = ['message'];
```

But after removing WebSocket from zone.js, Angular passionately triggered change detection in the application. After a long search, it turned out that the implementation of the event handler API accidentally entered the zone angular despite the fact that services were created in rxjs. Just calling `$.next()` already invited Angular to detect changes, and with an average of 50-100 events every second from  WebSocket, weak phones can't handle it.

I give an example solution to a problem when there is no time to modify the API:

1) Catch the beginning of the event stream and put `ngZone.runOutsideAngular()` on it.
2) Create a loop that will run an empty task in zone angular every `requestAnimationFrame`.

```typescript
interval(0, animationFrameScheduler).subscribe(() => {
  ngZone.run(() => {});
});
```

After such a change, the application works without any complaints. (CPU usage dropped to 30%). It is true that sometimes change detection is started unnecessarily, but still less times than before.

Such fun would not take place if the application API was written outside of Angular in an external library.
