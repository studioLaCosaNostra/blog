---
title: 'Hexo: Publish posts automatically on twitter.'
ampSettings:
  titleImage:
    path: title-image.png
tags:
  - hexo
  - twitter
  - nodejs
  - blogging
thumbnail:  title-image.png
date: 2019-03-13
---
*You will never forget to publish post on twitter.*
<!-- more -->

Since I started writing a blog, I started publishing status on Twitter when something new comes out. I did it manually. By profession, I'm a programmer, so doing it started to torture me after a few times. I thought that maybe I could find a plugin on the Internet for this purpose, but unfortunately I was disappointed. (WordPress already has such a plugin ready. :() But I found that I could easily write a plugin and here is ready [hexo-twitter-auto-publish][hexo-twitter-auto-publish] plugin. Below are described step by step what you need to do in order to enjoy this solution.

## Setup Twitter application for API access

1. Sign in on [https://developer.twitter.com/](https://developer.twitter.com/)
2. Apply for a developer account.
   **Their review of the application may take a few weeks.** You will receive an email notification when the review is over.
3. Open menu and go to **Apps**.
   ![Menu view][twitter-step-3]
4. Click **Create an app** button.
   ![Create app button view][twitter-step-4]
5. Fill in only the *required* fields of the application.
   ![App create form view][twitter-step-5]
6. After creating the application, go into details by clicking the details button.
   ![Apps list view][twitter-step-6]
7. Click on the **Keys and tokens** tab.
   ![App details view][twitter-step-7]
8. Generate **Consumer API keys** and **Access token & access token secret** with access level *Read and write*.
   ![App details - Keys and tokens view][twitter-step-8]
   The generated credentials will now be needed for the plugin configuration.

## Setup hexo plugin

1. Install plugin `npm i hexo-twitter-auto-publish`
2. Setup twitter authentication credentials
   There are two options to choose:
   - Adding variables to the shell startup file.
      For the bash shell will be `~/.bashrc` file for zsh shell will be `~/.zshrc` file.

      ```bash
      export TWITTER_CONSUMER_KEY=Xegp8XDTMqVxcI2tId1juT70X
      export TWITTER_CONSUMER_SECRET=oaGaU06IGqaTfObZnYdrYmDvxiHcHck8TQ9Xk61Ze1ghjHQYkP
      export TWITTER_ACCESS_TOKEN_KEY=929842798974656517-VuQxIuoLhtoeqW71LofX6M5fIw8Pf3c
      export TWITTER_ACCESS_TOKEN_SECRET=R5RZtQj5tLWbSgFx39lq6cd2AcIQRjQk5kbepOobxCplA
      ```

   - Adding a new configuration in the `_config.yml` file.

      ```yml
      twitterAutoPublish:
        consumerKey: Xegp8XDTMqVxcI2tId1juT70X
        consumerSecret: fq4eY5NmK2X9ZxSDSUaFqMBPWWMUCCYu35PMvzoqB0YzqLOTEs
        accessTokenKey: 929842798974656517-VuQxIuoLhtoeqW71LofX6M5fIw8Pf3c
        accessTokenSecret: R5RZtQj5tLWbSgFx39lq6cd2AcIQRjQk5kbepOobxCplA
      ```

After creating the post or after generating the page, you should see the new `twitter-db.json` file in the main directory. Any post status changes will now be saved in this file.

## About twitter-db.json

There are three fields in the database: `published`, `to-publish`, `to-destroy`.

- `published` - contains posts that are already on twitter and each post has a tweetId.
- `to-publish` - contains all new posts that have not yet appeared on Twitter.
- `to-destroy` - contains posts that for some reason have been moved to a working version, or we changed the `twitterAutoPublish` in the page from true to false.
  
**If you do not want a post to be sent to twitter, all you have to do is move it from `to-publish` to `published`.**

**New statuses are sent to the twitter only after calling the command: `hexo deploy`, or after calling a custom command: `hexo twitter-publish`.**

That's all I hope you liked this plugin and if you have any problems or suggestions what can be done better, write in issues on [github][github].

[hexo-twitter-auto-publish]: https://www.npmjs.com/package/hexo-twitter-auto-publish
[twitter-step-3]: step-3.png
[twitter-step-4]: step-4.png
[twitter-step-5]: step-5.png
[twitter-step-6]: step-6.png
[twitter-step-7]: step-7.png
[twitter-step-8]: step-8.png
[github]: https://github.com/studioLaCosaNostra/hexo-twitter-auto-publish
