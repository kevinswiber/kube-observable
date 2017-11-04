const debug = require('debug')('kube-pod-watcher:pod-watcher');
const { Observable } = require('rxjs');
const revolt = require('revolt');

const jsonStreamMiddleware = require('./json-stream-middleware');
const logConnectedMiddleware = require('./log-connected-middleware.js');

const watchURL = process.env.WATCH_URL || 
  'http://localhost:8001/api/v1/namespaces/default/pods?watch=true&timeoutSeconds=3';

const client$ = revolt()
  .use(logConnectedMiddleware(debug))
  .use(jsonStreamMiddleware)
  .get(watchURL)
  .retryWhen((errors$) => {
    return errors$
      .switchMap((err, index) => {
        const errorCount = index + 1;
        const pause = generateBackoff(errorCount);

        debug('error:', err.stack);
        debug('error count:', errorCount);
        debug(`reconnecting in ${pause}ms`);

        return Observable.timer(pause);
      });
  })
  .repeatWhen((notifications$) => {
    return notifications$
      .switchMap(() => {
        const pause = generateBackoff(1); // allow short, random reconnect time

        debug('connection closed');
        debug(`reconnecting in ${pause}ms`);

        return Observable.timer(pause);
      });
  });

module.exports = Observable.create(observer => {
  client$
    .subscribe({
      next: x => {
        debug('receiving data');
        observer.next(x);
      },
      error: err => observer.error(err),
      complete: () => observer.complete()
    });
});

const generateBackoff = function(attempt) {
  const reconnect = {
    min: 100,
    max: 30000, // max amount of time allowed to backoff
    maxRandomOffset: 1000, // max amount of time
  };

  if (attempt === 0) {
    return 0;
  }

  var random = parseInt(Math.random() * reconnect.maxRandomOffset);
  var backoff = (Math.pow(2, attempt) * reconnect.min);
  if (backoff > reconnect.max) {
    return reconnect.max + random;
  } else {
    return backoff + random;
  }
};
