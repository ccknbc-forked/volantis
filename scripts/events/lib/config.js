'use strict';

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

function merge(target, source) {
  for (const key in source) {
    if (isObject(target[key]) && isObject(source[key])) {
      merge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

module.exports = hexo => {
  if (!hexo.locals.get) return;

  var data = hexo.locals.get('data');
  if (!data) return;

  /**
   * Merge configs from _data/volantis.yml into hexo.theme.config.
   * If `override`, configs in volantis.yml will rewrite configs in hexo.theme.config.
   * If volantis.yml not exists, merge all `theme_config.*` into hexo.theme.config.
   */
  console.log(data.volantis);
  if (data.volantis) {
    if (data.volantis.override) {
      hexo.theme.config = data.volantis;
    } else {
      merge(hexo.config, data.volantis);
      merge(hexo.theme.config, data.volantis);
    }
  } else {
    merge(hexo.theme.config, hexo.config.theme_config);
  }

  if (hexo.theme.config.cache && hexo.theme.config.cache.enable && hexo.config.relative_link) {
    hexo.log.warn('Since caching is turned on, the `relative_link` option in Hexo `_config.yml` is set to `false` to avoid potential hazards.');
    hexo.config.relative_link = false;
  }
  hexo.config.meta_generator = false;

  // Custom languages support. Introduced in NexT v6.3.0.
  if (data.languages) {
    var { language } = hexo.config;
    var { i18n } = hexo.theme;

    var mergeLang = lang => {
      i18n.set(lang, merge(i18n.get([lang]), data.languages[lang]));
    };

    if (Array.isArray(language)) {
      for (const lang of language) {
        mergeLang(lang);
      }
    } else {
      mergeLang(language);
    }
  }
};
