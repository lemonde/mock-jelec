const _ = require('lodash');

module.exports = (publication) => _.pick(publication, [
  'type',
  'name',
  'stagingAreas'
]);