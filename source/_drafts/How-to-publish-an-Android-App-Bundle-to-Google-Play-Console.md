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

Dla tych którzy nie chcą wgłębiać się w działanie programu a tylko chcą go użyć w swoim projekcie do zapraszam do gotowej paczki na npm: [publish-aab-google-play](https://www.npmjs.com/package/publish-aab-google-play)

Całkiem niedawno Google Play wprowadziło nowy format aplikacji `.aab`. Daje o wiele mniejszy rozmiar aplikacji niż poprzedni `.apk`. Po jakimś czasie cordova też zaczęła wspierać ten nowy format podczas budowania release. Ale niestety `playup` z którego korzystałem przez długi czas do aktualizowania aplikacji w Google Play nie działa z nowym formatem Android App Bundle :(. Rozpocząłem szukanie innego programu, który będzie potrafił wysyłać `.aab`. Z rezygnacją zakończyłem poszukiwania na paru nieskończonych skryptach z użyciem googleapis. Uznałem że raczej nikt jeszcze nie napisał w node.js takiego programiku, więc uznałem że to dobra okazja samemu stworzyć takie dzieło. Do tego celu wykorzystałem powyżej podane `googleapis` oraz `commander` do obsługi terminalowych argumentów.

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

Program działa podobnie jak `playup`. Podajemy ścieżkę do api key od google, nazwę pakietu (tutaj jest dodatkowo, ale może w przyszłości jakoś wyciągnę nazwę z .aab), ścieżkę do `.aab` i oczywiście track na który ma wpaść nasza aplikacja (alpha, beta, internal). Dodatkowo po dodaniu argumentu `--exit` po wystąpieniu błędu program zwraca 1 jako kod błędu, przydatne jak mamy stworzyć continous integration i chcemy być ostrzeżeni czy zakończyło się działanie programu poprawnie.



