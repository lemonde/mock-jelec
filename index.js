const request = require('request');
const fs = require('fs');
const async = require('async');
const path = require('path');
const _ = require('lodash');

const PUBLICATION_FILE = './mock/publication.json';
const ARTICLES_DIR = './mock/articles';
const URI = (articleId, revisionType = 'digital') => [
  `http://editoapi.lemonde.fr/v1/articles/${articleId}?`,
  'withRelated[]=nodes.content&',
  'withRelated[]=editorial_type&',
  'withRelated[]=authors&',
  'withRelated[]=teasers.article_media.media&',
  'withRelated[]=medias.media.medias&',
  'withRelated[]=medias.media.medias.media&',
  'withRelated[]=medias.media.nodes.content&',
  `revisionType=${revisionType}`
].join('');

const formatPublication = (buffer, callback) => {
  try {
    callback(null, JSON.parse(buffer.toString()))
  } catch(err) {
    callback(null, err);
  }
}

const getArticles = (publication, callback) => (
  callback(null,
    _(publication.stagingAreas)
    .map('contents')
    .flatten()
    .map('contentId')
    .value()
  )
);

const getArticlesContents = (articlesIds, callback) => async.map(articlesIds, _.partial(getArticleContent, false), callback);

const getArticleContent = (retry, articleId, callback) => request({
  url: URI(articleId, retry ? 'auto' : 'digital'),
  timeout: 3000,
  json: true
}, (err, res, article) => {
  if (err || res.statusCode !== 200) return callback(new Error(err || `${articleId} not found`));
  if (! article.data[0] && ! retry) return getArticleContent(true, articleId, callback);
  callback(null, article);
});

const createArticlesFiles = (articles, callback) => async.map(articles, createArticleFile, callback);

const createArticleFile = (article, callback) => {
  if (! article.data[0]) return callback(null);
  fs.writeFile(getFilename(article), JSON.stringify(article), callback);
};

const getFilename = (article) => path.resolve(__dirname, ARTICLES_DIR, `${article.data[0].article_id}.json`);

async.waterfall([
  async.apply(fs.readFile, PUBLICATION_FILE),
  formatPublication,
  getArticles,
  getArticlesContents,
  createArticlesFiles
], (err, files) => {
  console.log(err || 'success');
  process.exit(1);
});
