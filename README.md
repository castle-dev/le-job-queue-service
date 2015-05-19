le-job-queue-service
=========

**Create and process background jobs**

## Installation

  `npm install le-job-queue-service`

## Usage

```
  var storage = /* initialize storage service */
  var JobQueueService = require('le-email-service');
  var jobQueue = new JobQueueService(storage);

  // Add a job, likely done client-side
  jobQueue.addJob('welcome-email', { name: 'Optimus' })
  .then(function (record) {
    ...
  });

  // create a worker, likely done server-side
  var provider = /* initialize job queue provider (such as le-job-queue-provider-firebase) */
  function processJob (job, complete) {
    ...
    complete();
  }
  jobQueue.createWorker(provider, processJob);
```

## Tests

* `npm test` to run unit tests once
* `gulp tdd` to run unit and e2e tests when tests change
* `gulp coverage` to run unit tests and create a code coverage report

## Contributing

Please follow the project's [conventions](https://github.com/castle-dev/le-job-queue-service/blob/develop/CONTRIBUTING.md) or your changes will not be accepted

## Release History

* 0.1.0 Initial release
