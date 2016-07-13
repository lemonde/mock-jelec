const _ = require('lodash');
const textNodes = require('./text-nodes');

const formatters = (type) => {
  switch (type) {
    case 'text_node_revisions': return textNodes;
    case 'article_media_revisions': return _.noop;
    default: return textNodes;
  };
};

module.exports = (article) => {
  if (! article) return article;

  return Object.assign(
    article,
    {
      content: (article.nodes || [])
        .map(node => formatters(node.content_type)(node))
        .join('')
    }
  );
};