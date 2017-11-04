const Observable = require('rxjs').Observable;

module.exports = debug => {
  return handle => {
    handle('response', { affinity: 'hoist' }, (pipeline$) => {
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
};
