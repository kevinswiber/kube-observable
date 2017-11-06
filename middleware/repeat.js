const debug = require('debug')('kube-observable:middleware:repeat');
const { Observable } = require('rxjs');

const generateBackoff = require('./backoff');

module.exports = handle => {
  handle('response', (pipeline$) => {
    return pipeline$.repeatWhen((notifications$) => {
      return notifications$
        .switchMap(() => {
          const pause = generateBackoff(1); // allow short, random reconnect time

          debug('connection closed');
          debug(`reconnecting in ${pause}ms`);

          return Observable.timer(pause);
        });
    });
  });
};

