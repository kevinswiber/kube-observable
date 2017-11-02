const JSONStream = require('json-stream');
const Rx = require('rxjs');

module.exports = handle => {
  handle('response', pipeline => {
    return pipeline.flatMap(env => {
      return Rx.Observable.create(observer => {
        const stream = new JSONStream();

        stream.on('data', obj => {
          observer.next(obj);
        });
        stream.on('error', err => {
          observer.error(err);
        });
        stream.on('end', () => {
          observer.error('connection closed');
        });

        env.response.pipe(stream);
      });
    });
  });
};