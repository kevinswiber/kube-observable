const PODS_URL = 'http://localhost:8001' +
  '/api/v1/namespaces/default/pods' +
  '?watch=true&timeoutSeconds=3';

const pods$ = require('../')(PODS_URL);

pods$
  .subscribe(obj => {
    console.log({
      type: obj.type,
      name: obj.object.metadata.name
    });
  });

