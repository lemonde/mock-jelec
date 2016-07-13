const _ = require('lodash');

module.exports = (article) => _.pick(article, [
  'article_id',
  'title',
  'chapo',
  'nb_char',
  'nodes',
  'medias',
  'content'
]);