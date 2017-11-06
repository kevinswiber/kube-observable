# kube-observable

Watch events on Kubernetes resources using a resilient, reactive Observable.

- Sets a random offset between re-connect times.
- Uses exponential back-off on errors.
- Get debug info by setting env var `DEBUG=kube-observable:*`.

## Example

```js
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
```

## Options

### `watchURL`

The Kubernetes API URL used to watch resources.

## License

MIT
