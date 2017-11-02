const Rx = require('rxjs');
const revolt = require('revolt');

const jsonStreamMiddleware = require('./json-stream-middleware');

const watchURL = process.env.WATCH_URL || 
  'http://localhost:8001/api/v1/namespaces/default/pods?watch=true&timeoutSeconds=60';

module.exports = Rx.Observable.create(observer => {
  let errorCount = 0;

  const startClient = () => {
    revolt()
      .use(jsonStreamMiddleware)
      .get(watchURL)
      .subscribe({
        // handle errors and closes manually
        // using built-in Observable handling
        // increments an internal error count
        next: x => {
          observer.next(x);
        },
        error: err => {
					let pause;

          if (err === 'connection closed') {
						pause = generateBackoff(1); // use short, random reconnect time
          } else {
            pause = generateBackOff(errorCount++);
          }

          console.log('pause:', pause);
          setTimeout(startClient, pause);
        }
      });
  };

  startClient();
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
