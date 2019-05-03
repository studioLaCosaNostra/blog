---
title: How to retrieve information from Adsense about the current account balance.
date: 2019-01-23 12:58:31
tags:
- node.js
- typescript
- adsense
thumbnail: title-image.png
ampSettings:
  titleImage:
    path: title-image.png
---

Unfortunately, Adsense requires you to log via OAuth to get Adsense account informations. For this purpose, we will use the keys generated on [Google Adsense Management API site](https://developers.google.com/adsense/management/getting_started). On this site just **click** that button.
![Register your app button](how-to-retrieve-information-from-adsense-about-the-current-account-balance/register-your-app-button.png)

- Enter new project name

![Adsense Managment API - Enter new project name](Adsense-Managment-API-Enter-new-project-name.png)

- Specify the project name

![Adsense Managment API - Specify the product name](Adsense-Managment-API-Specify-the-product-name.png)

- Configure your OAuth client
  Set http://localhost:3000/oauth2callback as a redirect URI

![Adsense Managment API - Configure your OAuth client](Adsense-Managment-API-Configure-your-OAuth-client.png)

- Click **download client configuration** and save as `google-oauth-keys.json`

![Adsense Management API - Download client configuration](Adsense-Management-API-Download-client-configuration.png)


Google OAuth2 keys should look like this

`google-oauth-keys.json`

```
{
  "web": {
    "client_id": "434543536-niwen3293vubu2643nu73.apps.googleusercontent.com",
    "project_id": "adsense-54357734",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_secret": "99h-wf8ewf8wvrrwd",
    "redirect_uris": [
      "http://localhost:3000/oauth2callback"
    ]
  }
}
```

Code of program to extract information about your monthly earnings from Google Adsense.

`adsense.ts`
```typescript
import { adsense_v1_4 } from 'googleapis';
import { readFile } from 'fs';
import { promisify } from 'util';
import { OAuth2Client } from 'google-auth-library';
import * as http from 'http';
import * as url from 'url';
import opn = require('opn');
import moment = require('moment');
import { transporter } from './email-transporter';
import { GetTokenResponse } from 'google-auth-library/build/src/auth/oauth2client';
import * as low from 'lowdb';
import * as FileAsync from 'lowdb/adapters/FileAsync';
import { Socket } from 'net';

async function getDb(): Promise<low.LowdbAsync<any>> {
  const adapter = new FileAsync('db.json');
  const db = await low(adapter);
  
  await db.defaults({ googleOAuth2: {} })
    .write();
  return db;
}

const readFileAsync = promisify(readFile);
/**
 * Start by acquiring a pre-authenticated oAuth2 client.
 */
let oAuth2Client: OAuth2Client;
export async function getAdsense() {
  if (!oAuth2Client) {
    oAuth2Client = await getAuthenticatedClient();
  }
  // After acquiring an access_token, you may want to check on the audience, expiration,
  // or original scopes requested.  You can do that with the `getTokenInfo` method.
  const adsense = new adsense_v1_4.Adsense({
    auth: oAuth2Client
  })
  const otherMonths = (await adsense.payments.list()).data;
  const otherMonthsSum = otherMonths && otherMonths.items && otherMonths.items.reduce((sum, item) => sum + Number(item.paymentAmount), 0) || 0;
  const date = new Date();
  const thisMonth = (await adsense.reports.generate({
    startDate: moment(new Date(date.getFullYear(), date.getMonth(), 1)).format('YYYY-MM-DD'),
    endDate: moment().format('YYYY-MM-DD'),
    metric: ['AD_REQUESTS', 'CLICKS', 'EARNINGS']
  })).data.totals;
  const thisMonthSum = thisMonth && Number(thisMonth[2]) || 0
  const sum = Number((thisMonthSum + otherMonthsSum).toFixed(2));
  return {
    thisMonthSum,
    otherMonthsSum,
    sum
  }
}

export const initAdsense = getAdsense;

/**
 * Create a new OAuth2Client, and go through the OAuth2 content
 * workflow.  Return the full client to the callback.
 */
async function getAuthenticatedClient() {
  const db = await getDb();
  const oauth2Client = await new Promise<OAuth2Client>(async (resolve, reject) => {
    // create an oAuth client to authorize the API call.  Secrets are kept in a `keys.json` file,
    // which should be downloaded from the Google Developers Console.
    const keysBuffer = await readFileAsync('./configs/google-oauth-keys.json');
    const keys = JSON.parse(keysBuffer.toString())
    const oAuth2Client = new OAuth2Client(
      keys.web.client_id,
      keys.web.client_secret,
      keys.web.redirect_uris[0]
    );
    // check credentials in db.json
    const credentials = db.get('googleOAuth2.credentials').value();
    if (credentials) {
      oAuth2Client.setCredentials(credentials);
      return resolve(oAuth2Client);
    }
    // Generate the url that will be used for the consent dialog.
    const authorizeUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: 'https://www.googleapis.com/auth/adsense.readonly'
    });
    let socket: Socket;
    // Open an http server to accept the oauth callback. In this simple example, the
    // only request to our webserver is to /oauth2callback?code=<code>
    const server = http
      .createServer(async (request, response) => {
        try {
          if (request.url && request.url.indexOf('/oauth2callback') > -1) {
            // acquire the code from the querystring, and close the web server.
            const urlSearchParams: url.URLSearchParams = new url.URL(request.url, 'http://localhost:3000')
              .searchParams;
            const code = urlSearchParams.get('code');
            response.writeHead(200, { "Content-Type": "text/html" });  
            response.end(`
            <html>
              <body>
                Authentication successful! Please return to the console.
              </body>
            </html>
            `);
            server.close();
            // Destroy one connection
            socket.destroy();
            // Now that we have the code, use that to acquire tokens.
            if (code) {
              const { tokens }: GetTokenResponse = await oAuth2Client.getToken(code);
              oAuth2Client.setCredentials(tokens);
              console.info('Tokens acquired.', JSON.stringify(oAuth2Client.credentials, null, 2));
              // save credentials to db.json
              await db.set('googleOAuth2.credentials', tokens).write();
              resolve(oAuth2Client);
            } else {
              console.log('Missing code in oauth2callback');
            }
          }
        } catch (error) {
          reject(error);
        }
      })
      .listen(3000, () => {
        // open the browser to the authorize url to start the workflow
        console.log('server created');
        opn(authorizeUrl, { wait: false }).then(childProcess => childProcess.unref());
      });
    server.on('connection', (newSocket: Socket) => {
      socket = newSocket;
    })
  });
  return oauth2Client;
}


initAdsense();
```

to run code

```bash
ts-node adsense.ts
```

The program will open the google page for you to authorize the adsense account.

![Google adsense authorization grant access prompt](authorization-access-grant.png)

After authorization, the program already stores an authentication token, so every next call to the `getAdsense` function will not open the browser window any more.

![Authorization callback success](Auth-success-callback.png)

At the first authorization, OAuth2 sends us a credentials **refresh_token**. 

```
Tokens acquired. {
  "access_token": "ya29.Glv9Y8SJ-4OTp5HVy8cSqCO",
  "refresh_token": "1/oe_PDv4g45gbAquNmCeTc99AkhDp3Aca090BE",
  "scope": "https://www.googleapis.com/auth/adsense.readonly",
  "token_type": "Bearer",
  "expiry_date": 1556827859753
}
{ thisMonthSum: 0, otherMonthsSum: 200.64, sum: 200.64 }
```

Thanks to him, we no longer have to ask for access for our program. We need to store credentials (with refresh_token) in the database, in this article we used the **lowdb** library to hold data in `db.json`