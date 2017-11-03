const debug = require('debug')('kube-pod-watcher:server');
const express = require('express');
const EventEmitter = require('events');
const EventStream = require('ssestream');

const podWatcher = require('./pod-watcher');

const app = express();

const cache = [];
const emitter = new EventEmitter();

app.get('/pods', (req, res) => {
  const stream = new EventStream(req);
  stream.pipe(res);
  emitter.on('data', obj => {
    stream.write({
      event: obj.type.toLowerCase(),
      data: obj
    });
  });

  res.on('close', () => {
    debug('response closed');
    stream.unpipe(res);
  });

  res.on('error', err => {
    debug('response error:', err);
    stream.unpipe(res);
  });
  
  res.on('timeout', () => {
    debug('response timeout');
    stream.unpipe(res);
  });
});

//app.listen(8080);

podWatcher
  .subscribe(obj => {
    obj = {
      type: obj.type,
      name: obj.object.metadata.name,
      status: JSON.stringify(obj.object.status, null, 2)
    }

    cache[obj.name] = obj;
    emitter.emit('data', obj);
  });
