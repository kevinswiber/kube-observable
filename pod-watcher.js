const debug = require('debug')('kube-pod-watcher:pod-watcher');
const Rx = require('rxjs');
const revolt = require('revolt');

const jsonStreamMiddleware = require('./json-stream-middleware');
const logConnectedMiddleware = require('./log-connected-middleware.js');

const { CONNECTION_CLOSED } = require('./constants');

const watchURL = process.env.WATCH_URL || 
  'http://localhost:8001/api/v1/namespaces/default/pods?watch=true&timeoutSeconds=60';

// We are wrapping the client request call in
// an Observable subscription.  This allows each retry to
// create a new connection to the Kubernetes API.
const client$ = Rx.Observable.create(observer => {
  return revolt()
    .use(logConnectedMiddleware(debug))
    .use(jsonStreamMiddleware)
    .get(watchURL)
    .subscribe(observer);
});

// When the Kubernetes API Server closes the connection,
// we are treating this like an error and using
// Observable retry logic to reconnect.
module.exports = client$
  .retryWhen(errors => {
    let errorCount = 0;
    return errors
      .flatMap(err => {
        if (err) {
          debug(err);
        }

        let pause; // backoff time

        if (err === CONNECTION_CLOSED) {
          errorCount = 0;
          pause = generateBackoff(1); // allow short, random reconnect time
        } else {
          pause = generateBackoff(errorCount++);
          debug('error count:', errorCount);
        }

        debug(`reconnecting in ${pause}ms`);

        return Rx.Observable.timer(pause);
      });
  })
  .map(data => {
    debug('receiving data');
    return data;
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
