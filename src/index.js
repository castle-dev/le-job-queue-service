var q = require('q');
var leAsymmetricEncryptionService = require('le-asymmetric-encryption');
/**
 * A tool for creating and processing background jobs
 * @class JobQueueService
 * @param {StorageService} storage an instance of le-storage-service that is used to create records
 * @param {string} type the type of queue you want to create, supported types are 'default', 'session', and 'fast', leaving the field undefined is the same as 'default'
 * @returns {service}
 */
var JobQueueService = function (storage, type) {
  if (!storage) { throw new Error('Instance of storage service required'); }
  if (type !== 'session' && type !== 'fast' && type !== 'default' && type !== undefined) {
    throw new Error('Invalid value for the type param, value: ' + type);
  }
  var queueType = type;
  var _storage = storage;
  var _provider;
  /**
   * Stores a new job to process
   * @function addJob
   * @memberof JobQueueService
   * @instance
   * @param {string} type the type of the job, used to determine how it should be processed
   * @param {string} data the data necessary to complete the job
   * @returns {promise} resolves with the newly created job record
   */
  this.addJob = function (type, data, sensitiveData) {
    if (!this.publicKey & sensitiveData) {
      this.fetchPublicKey();
    }
    if (sensitiveData) {
      sensitiveData = JSON.stringify(sensitiveData);
      var encryptedData = leAsymmetricEncryptionService.encrypt(sensitiveData, this.publicKey);
      data.encryptedData = encryptedData;
    }
    var record;
    if (queueType === 'fast') {
      record = _storage.createRecord('_fastQueue/task');
    } else if (queueType === 'session') {
      record = _storage.createRecord('_sessionQueue/task');
    } else {
      record = _storage.createRecord('_queue/task');
    }
    return record.update({
      type: type,
      data: data
    }).then(function () {
      return record;
    });
  }
  this.fetchPublicKey() = function {
    var publicKeyRecord = _storage.fetchRecord('Public Key', 'BACKGROUND_PUBLIC_KEY');
    this.publicKey = publicKeyRecord.getData();
  }
  /**
   * Stores a new job and resolve when the job is complete
   * @function performJob
   * @memberof JobQueueService
   * @instance
   * @param {string} type the type of the job, used to determine how it should be processed
   * @param {string} data the data necessary to complete the job
   * @returns {promise} resolves when the task is complete
   */
  this.performJob = function (type, data) {
    var deferred = q.defer();
    this.addJob(type, data)
    .then(function (record) {
      record.sync(function (recordData) {
        if (recordData === null) {
          record.unsync();
          deferred.resolve();
        }
      });
    });
    return deferred.promise;
  }
  /**
   * Creates a worker to process the jobs in the queue
   * @function createWorker
   * @memberof JobQueueService
   * @instance
   * @param {JobQueueProvider} provider the provider this service delegates to
   * @param {Function}  processJob function that processes the job. Called with two params `job` and `complete`. This function must call `complete()` to finish processing a job
   */
  this.createWorker = function (provider, processJob, privateKey) {
    if (!provider) { throw new Error('Job queue provider required'); }
    if (!processJob) { throw new Error('Process job callback required'); }
    var innerProcessJob = function (job, complete) {
      var decryptedDataJson = leAsymmetricEncryptionService.decrypt(job.encryptedData, privateKey);
      var decryptedData = JSON.parse(decryptedData);
      Object.assign(job.data, decryptedData)
      processJob(job, complete);
    }
    _provider = provider;
    _provider.createWorker(innerProcessJob);
  }
  /**
   * Prevents the worker from picking up new jobs and resolves once current jobs are complete
   * @function shutdown
   * @memberof JobQueueService
   * @instance
   * @returns {promise}
   */
  this.shutdown = function () {
    if (!_provider) { throw new Error('Job queue provider required'); }
    return _provider.shutdown();
  }
}

module.exports = JobQueueService;
