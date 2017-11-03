const Rx = require('rxjs');
const revolt = require('revolt');

const jsonStreamMiddleware = require('./json-stream-middleware');

const watchURL = process.env.WATCH_URL || 
  'http://localhost:8001/api/v1/namespaces/default/pods?watch=true&timeoutSeconds=3';

// We are wrapping the client request call in
// an Observable subscription.  This allows each retry to
// create a new connection to the Kubernetes API.
const client$ = Rx.Observable.create(observer => {
  return revolt()
    .use(jsonStreamMiddleware)
    .get(watchURL)
    .subscribe({
      next: x => {
        observer.next(x);
      },
      error: err => {
        observer.error(err);
      }
    });
});

// When the Kubernetes API Server closes the connection,
// we are treating this like an error and using
// Observable retry logic to reconnect.
let errorCount = 0;
module.exports = client$
  .retryWhen(errors => {
    return errors
      .flatMap(err => {
        let pause; // backoff time

        if (err === 'connection closed') {
          pause = generateBackoff(1); // allow short, random reconnect time
        } else {
          pause = generateBackoff(errorCount++);
        }

        return Rx.Observable.timer(pause);
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
