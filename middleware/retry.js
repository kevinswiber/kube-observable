const debug = require('debug')('kube-observable:middleware:retry');
const { Observable } = require('rxjs');

const generateBackoff = require('./backoff');

module.exports = handle => {
  handle('response', (pipeline$) => {
    return pipeline$.retryWhen((errors$) => {
      return errors$
        .switchMap((err, index) => {
          const errorCount = index + 1;
          const pause = generateBackoff(errorCount);

          debug('error:', err.stack);
          debug('error count:', errorCount);
          debug(`reconnecting in ${pause}ms`);

          return Observable.timer(pause);
        });
    });
  });
};
