import * as ghpages from 'gh-pages';

ghpages.publish('public', {
  branch: 'master',
  repo: 'https://' + process.env.GH_TOKEN + '@github.com/studioLaCosaNostra/studioLaCosaNostra.github.io',
  dest: '.',
  add: true,
  dotfiles: true
}, function (error) { console.error(error); });