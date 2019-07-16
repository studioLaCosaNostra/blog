---
title: Automate blog posts publishing on Github Pages with Travis
ampSettings:
  titleImage:
    path: title-image.png
tags:
  - automation
  - hexo
  - nodejs
  - Travis CI
thumbnail: title-image.png
date: 2019-07-11
---

Since I automated the creation of new versions of {% post_link Automate-electron-app-release-build-on-github-with-Travis-CI the qrcode generator %} electron application. I was overcome by the thought that I could do the same with my blog. Today I have found the time and finally I do not have to waste time on generating updates. :) Below you will find a detailed description of how I did it using Travis.

First, create a configuration file for Travis.

`./.travis.yml`

```yml
language: node_js
script:
  - npm run deploy
after_script:
  - sh ./.travis-commit-changes.sh
```

As you can see, it is extremely short, and this is because I have created additional scripts.

`./package.json`

```json
{
  "scripts": {
    "start": "hexo server --draft -p 5000",
    "clean": "hexo clean",
    "twitter-publish": "hexo twitter-publish",
    "gh-pages-deploy": "npm run gh-pages-build && npm run gh-pages-publish && hexo twitter-publish",
    "gh-pages-build": "NODE_ENV=production hexo generate --config _config.yml,_config.production.yml",
    "gh-pages-publish": "ts-node bin/gh-pages-publish",
    "test": "NODE_ENV=production hexo generate --config _config.yml"
  }
}
```

The `gh-pages-build` command generates all static files in the `public` directory.
Then `gh-pages-publish` sends all changes to github pages. I do not send via hexo deploy git, because the site also has additional directories that I do not want to lose.

`bin/gh-pages-publish.ts`

```typescript
import * as ghpages from 'gh-pages';

ghpages.publish('public', {
  branch: 'master',
  repo: 'https://' + process.env.GH_TOKEN + '@github.com/studioLaCosaNostra/studioLaCosaNostra.github.io',
  dest: '.',
  add: true,
  dotfiles: true
}, function (error) {
  if (error) {
    console.error(error);
    process.exit(-1);
  }
});
```

Thanks to this I also have no problem adding env `GH_TOKEN`, which Travis needs to send changes to github pages.

When the publication is finished, the command `hexo twitter-publish` is run. It automatically sends new Twitter entries as soon as the post appears publicly. If you want to know more about this module, I invite you to read the post in which I describe {% post_link Hexo-Publish-posts-automatically-on-twitter how to automatically publish twitter posts in hexo %}.

In addition, I had to create a simple script in bash that sends any changes that appeared in the files after `gh-pages-deploy`

`./.travis-commit-changes.sh`

```bash
#!/bin/bash

set -x
# doc: https://www.gnu.org/software/bash/manual/html_node/The-Set-Builtin.html#The-Set-Builtin


function setup_git() {
  git config --global user.email "travis@travis-ci.org"
  git config --global user.name "Travis CI"
}

function change_to_master_branch() {
  git stash
  git checkout master
  git pull
  git stash pop
}

function commit_changes() {
  git add -A
  # Create a new commit with a custom message
  # with "[skip ci]" to avoid a build loop
  # and Travis build number for reference
  git commit -m "Travis update ($TRAVIS_BUILD_NUMBER)" -m "[skip ci]"
  return $?
}

function push_changes() {
  # Add new "origin" with access token in the git URL for authentication
  git push https://${GH_TOKEN}@github.com/$TRAVIS_REPO_SLUG master
  return $?
}

setup_git

change_to_master_branch

commit_changes

# Attempt to commit to git only if "git commit" succeeded
if [ $? -ne 0 ]; then
  echo "Cannot commit new version"
  exit $?
fi

echo "Push to GitHub"
push_changes
```

## How to add GH_TOKEN to Travis

1. Go to Travis website with the project (for me it is [https://travis-ci.org/studioLaCosaNostra/blog](https://travis-ci.org/studioLaCosaNostra/blog))
2. Click `More options` in the upper right corner.
3. Select `Settings`
4. Scroll to 'Environment Variables`
5. Add a new entry `GH_TOKEN`

At the next build, Travis should add the variable itself to the environment.

PS: Travis automatically recognizes the version of the node you need to install based on the `.nvmrc` file. Just `echo "10.15.3" > .nvmrc` and Travis will take care of the rest.

That's all, I hope that you could use my article, if you have any questions, then boldly write them in a comment, and I will try to answer them.
