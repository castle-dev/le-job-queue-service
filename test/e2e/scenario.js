var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var chaiAsPromised = require("chai-as-promised");
var expect = chai.expect;
chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('e2e tests::', function () {
  this.timeout(10000);
  var service;
  var provider;
  var spy;
  before(function () {
    var StorageProvider = require('le-storage-provider-firebase');
    var StorageService = require('le-storage-service');
    var firebaseUrl = process.env.FIREBASE_URL;
    var storage = new StorageService(new StorageProvider(firebaseUrl));
    var JobQueueProvider = require('le-job-queue-provider-firebase');
    var JobQueueService = require('../../src/index.js');
    provider = new JobQueueProvider(firebaseUrl);
    service = new JobQueueService(storage);
  });
  it('should respect logic', function () {
    expect(true).to.be.true;
    expect(true).not.to.be.false;
  });
  it('should create a worker to process the jobs', function (done) {
    spy = sinon.spy();
    var promise = service.addJob('welcome-email', { name: 'Tom' })
    .then(function () {
      var processJob = function (data, complete) {
        spy();
        complete();
      }
      service.createWorker(provider, processJob);
      setTimeout(function () { // give the worker time to do it's thang
        expect(spy).to.have.been.calledOnce;
        done();
      }, 3000);
    });
  });
  it('should add two more jobs', function () {
    var promise = service.addJob('welcome-email', { name: 'Amy' })
    .then(function () {
      return service.addJob('welcome-email', { name: 'Scott' });
    })
    return expect(promise).to.eventually.be.resolved;
  });
  it('should process the two new jobs as well', function (done) {
    setTimeout(function () { // give the worker time to do it's thang
      expect(spy).to.have.been.calledThrice;
      done();
    }, 5000);
  });
});
