
'use strict';

const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const URL = require('url');

function isExternal(url,config) {
    const exclude = config.nofollow.exclude;
    const myhost = URL.parse(config.url).hostname;
    const hostname = URL.parse(url).hostname;
    if (!hostname) {
        return false;
    }

    if (exclude && !Array.isArray(exclude)) {
        exclude = [exclude];
    }

    if (exclude && exclude.length) {
        for (var i = 0, len = exclude.length; i < len; i++) {
            if (hostname == exclude[i]) return false;
        }
    }

    if (hostname != myhost) {
        return true;
    }
    return false;
}

function nofollow(source){
  const config = this.config;
  const dom = new JSDOM(source);
  dom.window.document.querySelectorAll('a').forEach((element) => {
    const href = element.getAttribute('href');
    if (href && isExternal(href,config)) {
      element.setAttribute('rel', 'external nofollow noopener noreferrer');
      element.setAttribute('target', '_blank');
    }
  })
  return dom.serialize();
};


if (hexo.config.nofollow && hexo.config.nofollow.enable) {
  hexo.extend.filter.register('after_render:html', nofollow);
}
