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
date: 2019-06-02
---

Working on more and more programs, some activities beginning to become boring and monotonous. One of them is reporting the application update in the app store. Unfortunately, this can not be done through the API, for example: in the Google Play Store. What could be integrated with jenkins or travis-ci. Everything needs to be clicked manually, and it takes our valuable time that can be used for other duties. Below I paste a project to automate these activities using the puppeteer and closing everything into one command.

## Setup project.

- Create project directory.
  `mkdir app-store-submission-cli`
- Go to project directory.
  `cd app-store-submission-cli`
- Initialize npm package.
  `npm init`
- Install required puppeteer, debug log, semver and minimist.
  `npm i puppeteer debug semver minimist`
- Install also typescript transpiler and types for libs.
  `npm i typescript @types/puppeteer @types/debug @types/semver @types/minimist --save-dev`
- Install also google typescript style helpers.
  `npx gts init`
- Create source code dir
  `mkdir src`

- Add to package.json start script.

  ```json
  {
    "scripts": {
      "start": "node build/src/index.js"
    }
  }
  ```

- Add to tsconfig.json *dom* lib for puppeteer types check
  ```json
  {
    "compilerOptions": {
      "lib": ["dom"]
    }
  }
  ```
  
- Go to source dir
  `cd src`
- Init index.ts
  `touch src/index.ts`
- Paste code:
  
  ```typescript
  import * as puppeteer from 'puppeteer';
  import { Frame, Page, Cookie } from 'puppeteer';
  import * as fs from 'fs';
  import * as readline from 'readline';
  import * as debug from 'debug';
  import * as semver from 'semver';
  import * as minimist from 'minimist';

  const argv = minimist(process.argv.slice(2));
  const log = debug('apple-app-store');

  enum Platform {
    iOS = 'iOS',
    tvOS = 'tvOS',
  }

  const clickSignInButton = async (frame: Frame) => {
    log('clickSignInButton');
    const element = await frame.waitForSelector(
      '#stepEl > sign-in > #signin > .container > #sign-in:not(disabled)'
    );
    await element.click();
  };

  const saveCookies = async (page: Page) => {
    log('saveCookies');
    const cookies: Cookie[] = await page.cookies();
    fs.writeFileSync('cookies.json', JSON.stringify(cookies, null, 2));
  };

  const loadCookies = async (page: Page) => {
    log('loadCookies');
    if (!fs.existsSync('cookies.json')) {
      return;
    }
    const cookies: Cookie[] = JSON.parse(
      fs.readFileSync('cookies.json').toString()
    );
    for (let index = 0; index < cookies.length; index++) {
      const cookie = cookies[index];
      await page.setCookie(cookie);
    }
  };

  const openVerifyDeviceOptions = async (frame: Frame) => {
    log('openVerifyDeviceOptions');
    const selector = '#no-trstd-device-pop';
    await frame.waitForSelector(selector);
    await frame.click(selector);
  };

  const usePhoneTextCode = async (frame: Frame) => {
    log('usePhoneTextCode');
    const selector = '#use-phone-link';
    await frame.waitForSelector(selector);
    await frame.click(selector);
  };

  const clickTrustBrowser = async (frame: Frame) => {
    log('clickTrustBrowser');
    const selector = 'button.trust-browser';
    const element = await frame.waitForSelector(selector);
    await element.click();
  };

  const askForVerificationCode = (): Promise<string> => {
    log('askForVerificationCode');
    const readlineInterface = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    return new Promise(resolve => {
      readlineInterface.question(
        'Please type your verification code: ',
        answer => {
          console.log(`Thank you for verification code: ${answer}`);
          readlineInterface.close();
          resolve(answer);
        }
      );
    });
  };

  const authFrameSelector = '#aid-auth-widget-iFrame';
  const isLoginForm = async (page: Page) => {
    log('isLoginForm');
    return page.$(authFrameSelector);
  };

  const login = async (page: Page, user: string, password: string) => {
    log('login');
    const frameElement = await page.$(authFrameSelector);
    if (!frameElement) {
      throw new Error(`Missing frame ${authFrameSelector}`);
    }
    const frame = await frameElement.contentFrame();
    if (!frame) {
      throw new Error(`Missing frame ${authFrameSelector}`);
    }
    const accountNameInputSelector = '#account_name_text_field';
    await frame.waitForSelector(accountNameInputSelector);
    await frame.focus(accountNameInputSelector);
    await page.keyboard.type(user);
    await clickSignInButton(frame);
    const passwordInputSelector = '#password_text_field';
    await frame.waitForSelector(passwordInputSelector);
    await frame.waitFor(2000);
    await frame.focus(passwordInputSelector);
    await page.keyboard.type(password);
    await clickSignInButton(frame);
    const verifyDeviceSelector = 'verify-device';
    await frame.waitForSelector(`${verifyDeviceSelector}`);
    const isVerifyDevice = await frame.$(verifyDeviceSelector);
    if (isVerifyDevice) {
      console.log('Verify device.');
      await openVerifyDeviceOptions(frame);
      await usePhoneTextCode(frame);
      const verificationCode = await askForVerificationCode();
      await page.keyboard.type(verificationCode);
      await clickTrustBrowser(frame);
    }
  };

  const homePageSelector = '#homepage-container';
  const isHomePage = async (page: Page) => {
    log('isHomePage');
    return page.$(homePageSelector);
  };

  const goToApps = async (page: Page) => {
    log('goToApps');
    const xPath = '//div[text()="My Apps"]';
    const element = await page.waitForXPath(xPath);
    await page.waitFor(1000);
    await element.click();
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await page.waitForSelector('#manage-your-apps-search');
  };

  const goToApp = async (page: Page, appleId: string) => {
    log('goToApp');
    const selector = `a[href$='app\/${appleId}']`;
    const element = await page.waitForSelector(selector);
    await element.click();
    await page.waitForSelector('#appPageHeader');
  };

  const getPrepareSubmissionXPath = (option: Platform): string => {
    const texts = {
      [Platform.iOS]: 'IOS APP',
      [Platform.tvOS]: 'TVOS APP',
    };
    const xPath = `//h3[text()='${
      texts[option]
    }']/following-sibling::ul//a[contains(text(), 'Prepare for Submission')]`;
    return xPath;
  };

  const isActiveSubmission = async (page: Page, option: Platform) => {
    log('isActiveSubmission');
    await page.waitFor(1500);
    const isAvailableNewSubmission = await page.$x(
      getPrepareSubmissionXPath(option)
    );
    return isAvailableNewSubmission.length > 0;
  };

  const selectVersionOrPlatform = async (
    page: Page,
    option: Platform,
    version: number
  ) => {
    log('selectVersionOrPlatform');
    const openPopUpSelector = 'a.newVersion_link';
    const openPopUpElement = await page.waitForSelector(openPopUpSelector);
    await openPopUpElement.click();
    await page.waitForSelector('#versionPopUp.open');
    const xPath = `//div[@id="versionPopUp"]//a[not(@class="ng-hide") and text()="${option}"]`;
    const optionElement = await page.waitForXPath(xPath);
    if (optionElement) {
      await optionElement.click();
      await page.waitForSelector('.ng-modal:not(.ng-hide)');
      const updateSemVerMinor = semver.inc(`${version}.0`, 'minor');
      if (!updateSemVerMinor) {
        throw new Error(`Something wrong with version ${version}`);
      }
      const comVer = updateSemVerMinor.replace(/\.0$/, '');
      await page.keyboard.type(comVer);
      const buttonElement = await page.waitForSelector('.modal-buttons .primary');
      await buttonElement.click();
      await page.waitForSelector('#appStorePageContent p.status.waiting');
    } else {
      throw new Error('Missing option');
    }
  };

  const openUserMenu = async (page: Page) => {
    log('openUserMenu');
    const selector = '.mobile-user-avatar';
    const element = await page.waitForSelector(selector);
    await page.waitFor(3000);
    await element.click();
    await page.waitForSelector('#itc-user-menustate:checked');
  };

  const closeUserMenu = async (page: Page) => {
    log('closeUserMenu');
    const selector = '.mobile-user-avatar';
    const element = await page.waitForSelector(selector);
    await element.click();
    await page.waitForSelector('#itc-user-menustate:not(:checked)');
  };

  const selectTeam = async (page: Page, teamName: string) => {
    log('selectTeam');
    const xPath = `//label[contains(@class, 'custom-radio-check') and text() = '${teamName}']`;
    await openUserMenu(page);
    const element = await page.waitForXPath(xPath);
    const forAttribute = await page.evaluate(element => {
      return element.getAttribute('for');
    }, element);
    const isChecked = await page.evaluate(id => {
      const element = document.getElementById(id);
      if (!element) {
        throw new Error('Missing select team input');
      }
      return element.getAttribute('checked') !== null;
    }, forAttribute);
    if (isChecked) {
      await closeUserMenu(page);
    } else {
      await element.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
    }
  };

  const goToReadyForSale = async (page: Page, option: Platform) => {
    log('goToReadyForSale');
    if (option === 'iOS') {
      const selector = `a[href$='ios/versioninfo/deliverable']`;
      const element = await page.waitForSelector(selector);
      await page.waitFor(1500);
      await element.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
    }
    if (option === 'tvOS') {
      throw new Error('Not implemented');
    }
  };

  const getCurrentVersion = async (page: Page, option: Platform) => {
    log('getCurrentVersion');
    await goToReadyForSale(page, option);
    const selector = `#appVerionInfoHeaderId h1`;
    await page.waitFor(2000);
    const element = await page.waitForSelector(selector);
    const text = await page.evaluate(element => element.textContent, element);
    const version = Number(text.replace(/^\D+/g, ''));
    return version;
  };

  const createNewSubmission = async (page: Page, option: Platform) => {
    log('createNewSubmission');
    const version = await getCurrentVersion(page, option);
    await selectVersionOrPlatform(page, option, version);
  };

  const goToPrepareSubmission = async (page: Page, option: Platform) => {
    log('goToPrepareSubmission');
    const xPath = getPrepareSubmissionXPath(option);
    const element = await page.waitForXPath(xPath);
    await element.click();
    await page.waitForSelector('#appStorePageContent p.status.waiting');
  };

  const typeVersionInformation = async (page: Page, text: string) => {
    log(`typeVersionInformation: START\n${text}\nEND`);
    const xPath = `//label[contains(text(), "What's New in This Version")]/following-sibling::span//span//textarea`;
    const element = await page.waitForXPath(xPath);
    await page.evaluate(element => {
      element.value = '';
    }, element);
    await element.focus();
    await page.keyboard.type(text);
  };

  const typePromotionalText = async (page: Page, text = '') => {
    log(`typePromotionalText: START\n${text}\nEND`);
    const xPath = `//label[contains(text(), "Promotional Text")]/following-sibling::span//span//textarea`;
    const element = await page.waitForXPath(xPath);
    await page.evaluate(element => {
      element.value = '';
    }, element);
    await element.focus();
    await page.keyboard.type(text);
  };

  const selectBuild = async (page: Page, buildVersion: string) => {
    log('selectBuild');
    const deleteIconSelector = 'td a.deleteIcon';
    const deleteIconElement = await page.$(deleteIconSelector);
    if (deleteIconElement) {
      await deleteIconElement.click();
    }
    const addButtonXPath = `//h1[contains(text(), "Build")]//a[contains(@class, "addIcon")]`;
    const addButtonElement = await page.waitForXPath(addButtonXPath);
    await addButtonElement.click();
    const buildOnListXPath = `//div[contains(@class, "buildModalList")]//tr[td//text()[contains(., "${buildVersion}")]]`;
    const buildOnListElement = await page.waitForXPath(buildOnListXPath);
    const buildCheckboxElement = await buildOnListElement.$('a.radiostyle');
    if (!buildCheckboxElement) {
      throw new Error('Missing build version checkbox');
    }
    await buildCheckboxElement.click();
    await page.waitForSelector('div.buildModalList a.radiostyle.checked');
    const buttonElement = await page.waitForSelector('.modal-buttons .primary');
    await buttonElement.click();
  };

  const saveChanges = async (page: Page) => {
    log('saveChanges');
    const xPath =
      '//div[contains(@class, "pane-layout-content-header-buttons")]//button[span[contains(text(), "Save")]]';
    const element = await page.waitForXPath(xPath);
    await element.click();
  };

  const submitForReview = async (page: Page) => {
    log('submitForReview');
    const xPath =
      '//div[contains(@class, "pane-layout-content-header-buttons")]//button[contains(text(), "Submit for Review")]';
    const element = await page.waitForXPath(xPath);
    await element.click();
  };

  const main = async () => {
    const accountName: string = argv.login || argv.l;
    if (!accountName) {
      throw new Error('Missing argument --login | -l');
    }
    const password: string = argv.password || argv.p;
    if (!password) {
      throw new Error('Missing argument --password | -p');
    }
    const appAppleId = argv.appleId || argv.id;
    if (!appAppleId) {
      throw new Error('Missing argument --appleId | --id');
    }
    const versionInformation = argv.versionInformation || argv.v;
    if (!versionInformation) {
      throw new Error('Missing argument --versionInformation | -v');
    }
    const buildVersion: string = argv.buildVersion || argv.b;
    if (!buildVersion) {
      throw new Error('Missing argument --buildVersion | -b');
    }
    const browser = await puppeteer.launch({
      headless: !(argv.headless === 'false' || argv.h === 'false'),
    });
    log('newPage');
    const page = await browser.newPage();
    loadCookies(page);
    const url = 'https://appstoreconnect.apple.com/';
    log(`go to ${url}`);
    await page.goto(url);
    await page.waitForSelector(`${authFrameSelector}, ${homePageSelector}`);
    if (await isLoginForm(page)) {
      await login(page, accountName, password);
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      await page.waitForSelector(homePageSelector);
    }
    if (await isHomePage(page)) {
      await goToApps(page);
      const teamName: string = argv.teamName || argv.t;
      if (teamName) {
        await selectTeam(page, teamName);
      }
      await goToApp(page, appAppleId);
      const isSubmission = await isActiveSubmission(page, Platform.iOS);
      if (isSubmission === false) {
        await createNewSubmission(page, Platform.iOS);
      }
      await goToPrepareSubmission(page, Platform.iOS);
      await typeVersionInformation(page, versionInformation);
      const promotionalText = argv.promotionalText || argv.r;
      await typePromotionalText(page, promotionalText);
      await selectBuild(page, buildVersion);
      await saveChanges(page);
      // await submitForReview(page);
    }
    await saveCookies(page);
    log('close');
    await browser.close();
  };

  main().catch(error => console.error(error));
  ```

- Compile program
  `npm run compile`

## How to use program.

The program requires minimum options to provide a new version in the app store, ie:
- `--login || -l && --password || -p` - Login data.
- `--appleId || --id` - Application ID (AppleId).
- `--versionInformation || -v` - Information about the new version (Apple requires us to know what's new appeared in the new version).
- `--buildVersion || -b` - Build version number sent to Testflight.

optional:
- `--headless || -h` - set `false` to see browser.
- `--promotionalText || -r` - Promotional text.
- `--teamName || -t` - Team name (if we belong to more than one).

Example use:
`npm run start -- -l studiolacosanostra@gmail.com -p <password> --id 14445343 -v "Some awesome feature" -b 5.6.3`

## How to debug and develop the program

To simplify my work during debugging I added a debug package. By adding env at the start of the program, we have an insight into the various stages of the program.

Example use:
`DEBUG=apple-app-store* npm run start -- -l studiolacosanostra@gmail.com -p <password> --id 14445343 -v "Some awesome feature" -b 5.6.3 -h false`

```bash
  apple-app-store newPage +0ms
  apple-app-store loadCookies +449ms
  apple-app-store go to https://appstoreconnect.apple.com/ +2ms
  apple-app-store isLoginForm +4s
  apple-app-store login +5ms
  apple-app-store clickSignInButton +3s
  apple-app-store clickSignInButton +2s
Verify device.
  apple-app-store openVerifyDeviceOptions +1s
  apple-app-store usePhoneTextCode +150ms
  apple-app-store askForVerificationCode +81ms
Please type your verification code: 581108
Thank you for verification code: 581108
  apple-app-store clickTrustBrowser +12s
  apple-app-store isHomePage +2s
  apple-app-store goToApps +2ms
  apple-app-store goToApp +8s
  apple-app-store isActiveSubmission +12s
  apple-app-store goToPrepareSubmission +2s
  apple-app-store typeVersionInformation: START
  apple-app-store Some awesome feature
  apple-app-store END +6s
  apple-app-store typePromotionalText: START
  apple-app-store 
  apple-app-store END +192ms
  apple-app-store selectBuild +130ms
  apple-app-store saveChanges +8s
  apple-app-store saveCookies +408ms
  apple-app-store close +3ms
```

When logging in, Apple asks you to enter the code from a trusted device. I improved login by remembering cookies which reduces the number of attempts to log into the app store, but to completely automate it would be necessary to add a GSM modem that will send this code to the server when it is needed. Unfortunately, you can not disable two-factor verification. :(

source code: https://github.com/studioLaCosaNostra/app-store-submission-cli