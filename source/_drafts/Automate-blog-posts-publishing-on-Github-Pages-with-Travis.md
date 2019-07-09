---
title: Automate blog posts publishing on Github Pages with Travis
ampSettings:
  titleImage:
    path: null
tags:
  - automation
  - hexo
  - nodejs
  - Travis CI
thumbnail:
---

Od kiedy zautomatyzowałem w Travisie tworzenie nowych wersji {% post_link Automate-electron-app-release-build-on-github-with-Travis-CI aplikacji electronowej qrcode generator %}. Naszła mnie myśl że identycznie można zrobić z moim blogiem. Dzisiaj znalazłem czas i wreszcie nie muszę tracić czasu na generowanie aktualizacji. :) Poniżej opisuję jak dokładnie działa automatyczna publikacja zmian w moim blogu.

Na początku należy utworzyć plik konfiguracyjny dla Travisa.

`./.travis.yml`

```yml
language: node_js
script:
  - npm run deploy
after_script:
  - sh ./.travis-commit-changes.sh
```

Jak widać jest ekstremalnie krótki a to dlatego, że mam utworzone dodatkowe skrypty.

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

Komenda `gh-pages-build` generuje nam wszystkie pliki statyczne w katalogu `public`.
Następnie `gh-pages-publish` wysyła wszystkie zmiany na github pages. Nie wysyłam przez hexo deploy git, ponieważ strona posiada też dodatkowe katalogi, których nie chcę stracić.

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

Dzięki temu także nie mam problemu z dodaniem env `GH_TOKEN`, który jest potrzebny Travisowi do wysłania zmian na github'a.

Po zakończeniu wysyłania publikacji, uruchamiana jest komenda `hexo twitter-publish`. Dzięki niej automatycznie wysyłany jest nowy wpisy na twittera jak tylko post się pojawi publicznie. Jeśli chcesz wiedzieć więcej o tym module to zapraszam do posta w którym opisuję {% post_link Hexo-Publish-posts-automatically-on-twitter "jak publikować automatycznie wpisy na twitterze w hexo" %}

Dodatkowo musiałem stworzyć prosty skrypt w bash który wysyła wszelkie zmiany jakie się pojawiły w plikach po `gh-pages-deploy`

`./.travis-commit-changes.sh`

```bash
#!/bin/sh

set -x

setup_git() {
  git config --global user.email "travis@travis-ci.org"
  git config --global user.name "Travis CI"
}

commit_changes() {
  git add -A
  # Create a new commit with a custom message
  # with "[skip ci]" to avoid a build loop
  # and Travis build number for reference
  git commit -m "Travis deploy on production ($TRAVIS_BUILD_NUMBER)" -m "[skip ci]"
}

push_changes() {
  # Add new "origin" with access token in the git URL for authentication
  git push https://${GH_TOKEN}@github.com/$TRAVIS_REPO_SLUG master > /dev/null 2>&1
}

setup_git

commit_changes

# Attempt to commit to git only if "git commit" succeeded
if [ $? -eq 0 ]; then
  echo "Push to GitHub"
  push_changes
else
  echo "Cannot commit new version"
fi
```

## Jak dodać GH_TOKEN do Travisa

1. Należy wejść na stronę travisa z projektem u mnie to https://travis-ci.org/studioLaCosaNostra/blog
2. Kliknąć `More options` w prawym górnym rogu.
3. Wybrać `Settings`
4. Przewinąć do `Environment Variables`
5. Dodać nowy wpis `GH_TOKEN`

Przy następnej budowie Travis powinien sam dodać zmienną do środowiska.

