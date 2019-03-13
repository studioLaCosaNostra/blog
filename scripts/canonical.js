hexo.extend.helper.register('autoCanonical', function (config, page) {
  let base_url = config.url;
  if (config.url.charAt(config.url.length - 1) !== '/') base_url += '/';

  return '<link rel="canonical" href="' + base_url + page.canonical_path.replace('index.html', '') + '"/>';
});