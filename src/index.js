var q = require('q');
/**
 * A tool for creating and processing background jobs
 * @class JobQueueService
 * @param {StorageService} storage an instance of le-storage-service that is used to create records
 * @returns {service}
 */
var JobQueueService = function (storage) {
  if (!storage) { throw new Error('Instance of storage service required'); }
  var _storage = storage;
  /**
   * Stores a new job to process
   * @function addJob
   * @memberof JobQueueService
   * @instance
   * @param {string} type the type of the job, used to determine how it should be processed
   * @param {string} data the data necessary to complete the job
   * @returns {promise} resolves with the newly created job record
   */
  this.addJob = function (type, data) {
    var record = _storage.createRecord('_queue/task')
    return record
    .update({
      type: type,
      data: data
    })
    .then(function () { return record; });
  }
  /**
   * Creates a worker to process the jobs in the queue
   * @function createWorker
   * @memberof JobQueueService
   * @instance
   * @param {JobQueueProvider} provider the provider this service delegates to
   * @param {Function}  processJob function that processes the job. Called with two params `job` and `complete`. This function must call `complete()` to finish processing a job
   */
  this.createWorker = function (provider, processJob) {
    if (!provider) { throw new Error('Job queue provider required'); }
    if (!processJob) { throw new Error('Process job callback required'); }
    provider.createWorker(processJob);
  }
}

module.exports = JobQueueService;
