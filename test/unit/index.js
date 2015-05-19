var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var chaiAsPromised = require("chai-as-promised");
var sinonAsPromised = require("sinon-as-promised");
var expect = chai.expect;
chai.use(sinonChai);
chai.use(chaiAsPromised);

var JobQueueService = require('../../src/index.js');

describe('unit tests::', function () {
  var service;
  var mockProvider = {
    createWorker: function (processJob) {
      processJob();
    }
  };
  var mockStorage = {
    createRecord: sinon.stub().returns({
      update: sinon.stub().resolves()
    })
  };
  it('should respect logic', function () {
    expect(true).to.be.true;
    expect(true).not.to.be.false;
  });
  it('should be constructable', function () {
    expect(function () {
      service = new JobQueueService(mockStorage);
    }).not.to.throw();
  });
  it('should require an instance of the storage service to construct', function () {
    expect(function () {
      new JobQueueService();
    }).to.throw('Instance of storage service required');
  });
  it('should add jobs to the queue', function () {
    var promise = service.addJob('welcome-email', { name: 'Bob'});
    return expect(promise).to.eventually.be.fulfilled;
  });
  it('should create workers to process the queue', function () {
    var spy = sinon.spy();
    service.createWorker(mockProvider, spy);
    expect(spy).to.have.been.called;
  });
});
