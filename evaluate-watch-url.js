const DEFAULT_WATCH_URL = 'http://localhost:8001' +
  '/api/v1/namespaces/default/pods' +
  '?watch=true&timeoutSeconds=60';

module.exports = function evaluate(options) {
  let watchURL = DEFAULT_WATCH_URL;

  if (typeof options === 'string') {
    watchURL = options;
  } else if (typeof options === 'object' && options.watchURL) {
    watchURL = options.watchURL;
  }

  return watchURL;
}
