const JSONStream = require('json-stream');
const Rx = require('rxjs');

module.exports = handle => {
  handle('response', pipeline$ => {
    return pipeline$.switchMap(env => {
      return Rx.Observable.create(observer => {
        const stream = new JSONStream();

        stream.on('data', x => observer.next(x));
        stream.on('error', err => observer.error(err));
        stream.on('end', () => observer.complete());

        env.response.pipe(stream);
      });
    });
  });
};
