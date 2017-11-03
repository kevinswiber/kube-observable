const JSONStream = require('json-stream');
const Rx = require('rxjs');

const CONNECTION_CLOSED = require('./constants').CONNECTION_CLOSED;

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
          // We treat closed connections as errors
          // to take advantage of retry logic.
          observer.error(CONNECTION_CLOSED);
        });

        env.response.pipe(stream);
      });
    });
  });
};
