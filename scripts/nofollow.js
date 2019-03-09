
'use strict';

var cheerio = require('cheerio');
var URL = require('url');

function isExternal(url,config) {
    var exclude = config.nofollow.exclude;
    var myhost = URL.parse(config.url).hostname;
    var hostname = URL.parse(url).hostname;
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
  var config = this.config;
  var $ = cheerio.load(source);
  $('a').each(function(index, element) {
      var href = $(element).attr('href');
      if (href && isExternal(href,config)) {
          $(element).attr({
              rel: 'external nofollow noopener noreferrer',
              target: '_blank'
          });
      }
  });

  return $.html();
};


if (hexo.config.nofollow && hexo.config.nofollow.enable) {
  hexo.extend.filter.register('after_render:html', nofollow);
}
