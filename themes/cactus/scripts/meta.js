/**
* Meta Helper
* @description Generate meta tags for HTML header
* @example
*     <%- meta(post) %>
*/
function trim (str) {
    return str.trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
}

function split (str, sep) {
    var result = [];
    var matched = null;
    while (matched = sep.exec(str)) {
        result.push(matched[0]);
    }
    return result;
}

hexo.extend.helper.register('css', function cssHelper(...args) {
  return args.reduce((result, path, i) => {
    if (i) result += '\n';

    if (Array.isArray(path)) {
      return result + Reflect.apply(cssHelper, this, path);
    }
    if (!path.includes('?') && !path.endsWith('.css')) path += '.css';
    const url = hexo.extend.helper.get('url_for').bind(this)(path);
    return `${result}<link rel="stylesheet" href="${url}" media="none" onload="if(media!='all')media='all'"><noscript><link rel="stylesheet" href="${url}"></noscript>`;
  }, '');
});

hexo.extend.helper.register('meta', function (post) {
    var metas = post.meta || [];
    var output = '';
    var metaDOMArray = metas.map(function (meta) {
        var entities = split(meta, /(?:[^\\;]+|\\.)+/g);
        var entityArray = entities.map(function (entity) {
            var keyValue = split(entity, /(?:[^\\=]+|\\.)+/g);
            if (keyValue.length < 2) {
                return null;
            }
            var key = trim(keyValue[0]);
            var value = trim(keyValue[1]);
            return key + '="' + value + '"';
        }).filter(function (entity) {
            return entity;
        });
        return '<meta ' + entityArray.join(' ') + ' />';
    });
    return metaDOMArray.join('\n');
});
