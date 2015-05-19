var q = require('q');
var JobQueueService = function (storage) {
  if (!storage) { throw new Error('Instance of storage service required'); }
  var _storage = storage;

  this.addJob = function (type, data) {
    var record = _storage.createRecord('_queue/task')
    return record
    .update({
      type: type,
      data: data
    })
    .then(function () { return record; });
  }

  this.createWorker = function (provider, processJob) {
    if (!provider) { throw new Error('Job queue provider required'); }
    if (!processJob) { throw new Error('Process job callback required'); }
    provider.createWorker(processJob);
  }
}

module.exports = JobQueueService;
