
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

function lazyImages(source){
  const dom = new JSDOM(source);
  dom.window.document.querySelectorAll('img').forEach((element) => {
    element.setAttribute('loading', 'lazy');
  })
  return dom.serialize();
};


hexo.extend.filter.register('after_render:html', lazyImages);
