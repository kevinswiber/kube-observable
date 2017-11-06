const revolt = require('revolt');

const evaluate = require('./evaluate-watch-url');
const { logConnected, jsonStream, retry, repeat } = require('./middleware');

module.exports = options => {
  const watchURL = evaluate(options);

  return revolt()
    .use(logConnected)
    .use(jsonStream)
    .use(retry)
    .use(repeat)
    .get(watchURL)
};
