---
title: How to publish an Android App Bundle to Google Play Console
ampSettings:
  titleImage:
    path: title-image.png
tags:
  - nodejs
  - android
  - cordova
  - npm
  - google play
  - aab
thumbnail: title-image.png
date: 2020-01-06 16:00:00
---

For those who do not want to get into the program, but only want to use it in their project.
Then I invite you to the finished package on NPM: [publish-aab-google-play](https://www.npmjs.com/package/publish-aab-google-play)

Quite recently Google Play has introduced a new application format `.aab`. It gives a much smaller application size than the previous `.apk`. After some time, cordova also began to support this new format when building the release, but unfortunately `playup`, a program to send apk, which I used for a long time to update applications in Google Play. It doesn't work with the new Android App Bundle format :(. I started looking for another program that will be able to send `.aab`. With the resignation I finished searching on a few endless scripts using googleapis. I decided that no one has written such a program in node.js yet, so I decided that it's a good opportunity to create myself. For this purpose, I used the above mentioned `googleapis` and `commander` to handle terminal arguments.

`index.ts`

```typescript
import { ReadStream, createReadStream } from "fs";

import { google } from "googleapis";

type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;

const getClient = (keyFile: string) =>
  google.auth.getClient({
    keyFile,
    scopes: "https://www.googleapis.com/auth/androidpublisher"
  });

const getAndroidPublisher = (
  client: ThenArg<ReturnType<typeof getClient>>,
  packageName: string
) =>
  google.androidpublisher({
    version: "v3",
    auth: client,
    params: {
      packageName
    }
  });

const startEdit = (
  androidPublisher: ReturnType<typeof getAndroidPublisher>,
  id: string
) =>
  androidPublisher.edits.insert({
    requestBody: {
      id,
      expiryTimeSeconds: "600"
    }
  });

const upload = (
  androidPublisher: ReturnType<typeof getAndroidPublisher>,
  editId: string,
  packageName: string,
  aab: ReadStream
) =>
  androidPublisher.edits.bundles.upload({
    editId,
    packageName,
    media: {
      mimeType: "application/octet-stream",
      body: aab
    }
  });

const setTrack = (
  androidPublisher: ReturnType<typeof getAndroidPublisher>,
  editId: string,
  packageName: string,
  track: string,
  versionCode: string
) =>
  androidPublisher.edits.tracks.update({
    editId,
    track: track,
    packageName,
    requestBody: {
      track: track,
      releases: [
        {
          status: "completed",
          versionCodes: [versionCode]
        }
      ]
    }
  });

const commit = (
  androidPublisher: ReturnType<typeof getAndroidPublisher>,
  editId: string,
  packageName: string
) =>
  androidPublisher.edits.commit({
    editId,
    packageName
  });

const getAABStream = (filePath: string) => createReadStream(filePath);
const getId = () => String(new Date().getTime());

interface SchemaPublish {
  keyFile: string;
  packageName: string;
  aabFile: string;
  track: string;
}

export const publish = async ({
  keyFile,
  packageName,
  aabFile,
  track
}: SchemaPublish) => {
  const client = await getClient(keyFile);
  const stream = getAABStream(aabFile);
  const androidPublisher = getAndroidPublisher(client, packageName);
  const id = getId();
  const edit = await startEdit(androidPublisher, id);
  const editId = String(edit.data.id);
  const bundle = await upload(androidPublisher, editId, packageName, stream);
  if (
    bundle.data.versionCode === undefined ||
    bundle.data.versionCode === null
  ) {
    throw new Error("Bundle versionCode cannot be undefined or null");
  }
  await setTrack(
    androidPublisher,
    editId,
    packageName,
    track,
    String(bundle.data.versionCode)
  );
  await commit(androidPublisher, editId, packageName);
};
```

`bin.ts`

```typescript
import { join } from "path";
import program from "commander";
import { publish } from './index';

program
  .description("Publish Android App Bundle to Google Play")
  .requiredOption("-k, --keyFile <path>", "Set google api json key file")
  .requiredOption("-p, --packageName <name>", "Set package name (com.some.app)")
  .requiredOption("-a, --aabFile <path>", "Set path to .aab file")
  .requiredOption(
    "-t, --track <track>",
    "Set track (production, beta, alpha...)"
  )
  .option("-e, --exit", "Exit on error with error code 1.")
  .parse(process.argv);

publish({
  keyFile: join(process.cwd(), program.keyFile),
  packageName: program.packageName,
  aabFile: join(process.cwd(), program.aabFile),
  track: program.track
})
.then(() => {
  console.log('Publish complete.');
})
.catch((error: Error) => {
  console.error(error.message);
  process.exit(program.exit ? 1 : 0);
})
```

The program works like a `playup`. We provide the path to the api key from google, the name of the package (here it's extra, but maybe in the future I'll somehow pull the name out of the .aab), the path to `.aab` and of course the track our application is supposed to run on (alpha, beta, internal). Additionally, after adding the argument `--exit` after an error, the program returns 1 as an error code, useful for how to create continous integration and we want to be warned if the program ended up working correctly.

If you're interested in integrating the library in your program, below is an example of use.

```typescript
import { publish } from "publish-aab-google-play";

publish({
  keyFile: "./api-publish.json",
  packageName: "com.laCosaNostra.FiveHundredAndTwelve2",
  aabFile: "./platforms/android/app/build/outputs/bundle/release/app.aab",
  track: "beta"
})
  .then(() => {
    console.log("Success");
  })
  .catch(error => {
    console.error(error);
  });
```