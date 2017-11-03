module.exports = debug => {
  return handle => {
    handle('response', { affinity: 'hoist' }, pipeline => {
      return pipeline.map(env => {
        debug('connected');
        return env;
      });
    });
  };
};
