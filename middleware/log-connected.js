const debug = require('debug')('kube-observable:middleware:log-connected');
const { Observable } = require('rxjs');

module.exports = handle => {
  handle('response', (pipeline$) => {
    return Observable.create(observer => {
      pipeline$.subscribe({
        next: x => {
          debug('connected');
          observer.next(x);
        },
        error: err => observer.error(err),
        complete: () => observer.complete()
      });
    });
  });
};
