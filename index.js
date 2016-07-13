const request = require('request');
const fs = require('fs');
const async = require('async');
const path = require('path');
const _ = require('lodash');
const nodesFormatter = require('./formatters/nodes');
const articleFormatter = require('./formatters/article');

const PUBLICATION_FILE = './mock/publication.json';
const ARTICLES_DIR = './mock/articles';
const URI = (articleId, revisionType = 'digital') => `http://editoapi.lemonde.fr/v1/articles/${articleId}?withRelated[]=teasers.article_media.media&withRelated[]=medias.media.teasers&withRelated[]=nodes.content&withRelated[]=editorial_type&withRelated[]=authors&revisionType=${revisionType}`;

const getArticles = (publication, callback) => {
  callback(null,
    _(publication.stagingAreas)
    .map('contents')
    .reduce(
      (articles, stagingArea) => articles.concat(_.map(stagingArea, 'contentId')),
      []
    )
  );
};

const formatPublication = (buffer, callback) => {
  try {
    callback(null, JSON.parse(buffer.toString()))
  } catch(err) {
    callback(null, err);
  }
}

const getArticlesContents = (articlesIds, callback) => async.map(articlesIds, _.partial(getArticleContent, false), callback);

const getArticleContent = (retry, articleId, callback) => request({
  url: URI(articleId, retry ? 'auto' : 'digital'),
  timeout: 3000,
  json: true
}, (err, res, article) => {
  // console.log(`${articleId} with ${type} requested: ${res.statusCode}`);
  if (err || res.statusCode !== 200) return callback(new Error(err || `${articleId} not found`));
  if (! article.data[0] && ! retry) return getArticleContent(true, articleId, callback);
  callback(null, articleFormatter(article.data[0]));
});

const formatArticleContents = (articles, callback) => callback(null, articles.map(nodesFormatter));

const createArticlesFiles = (articles, callback) => async.map(articles, createArticleFile, callback);

const createArticleFile = (article, callback) => {
  if (! article) return callback(null);
  fs.writeFile(getFilename(article), JSON.stringify(article), callback);
};

const getFilename = (article) => path.resolve(__dirname, ARTICLES_DIR, `${article.article_id}.json`);

async.waterfall([
  async.apply(fs.readFile, PUBLICATION_FILE),
  formatPublication,
  getArticles,
  getArticlesContents,
  formatArticleContents,
  createArticlesFiles
], (err, files) => {
  console.log(err || 'success');
  process.exit(1);
});
