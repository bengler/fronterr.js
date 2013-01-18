var stacktrace = require("stacktrace-js");
var AirbrakeNotice = require("airbrake-notice");
var fronterr = require("../package");


function FrontErr(opts) {
  opts || (opts = {});
  if (!opts.service) throw Error("Please provide a FrontErr service endpoint");
  if (!opts.airbrakeAPI) throw Error("Please provide a Airbrake API version");

  this.app = {};
  this.app.name = (opts.app && opts.app.name);
  this.app.version = (opts.app && opts.app.version);

  this.environment = opts.environment;

  this.service = opts.service;
  this.notice = new AirbrakeNotice(opts.airbrakeAPI);
}

FrontErr.prototype.createBaseNotice = function() {
  return {
    apiKey: 'API_KEY_FOR:'+this.app.name,
    notifier: {
      name: 'fronterr.js',
      version: fronterr.version,
      url: fronterr.homepage || (fronterr.repository && fronterr.repository .url) || ''
    },
    serverEnvironment: {
      name: this.environment || 'n/a',
      projectRoot: this.path || document.location.pathname,
      appVersion: this.app.version || 'n/a'
    },
    request: {
      url: document.location.href,
      component: 'client-javascript',
      cgiData: {
        SERVER_NAME: document.location.host,
        HTTP_USER_AGENT: window.navigator.userAgent
      }
    }
  };
};

FrontErr.prototype.createNotice = function(error) {
  var notice = this.createBaseNotice();
  notice.error = {
    class: 'error',
    message: error.message,
    backtrace: [{number: 10, file:"internal:", method: ""}]
  };
  return this.notice.create(notice);
};

FrontErr.prototype.reportError = function(error) {
  return this.sendNotice(this.createNotice(error));
};

FrontErr.prototype.sendNotice = function(notice) {
  console.log('posting', notice);
  return this.service.post("/notifier_api/v2/notices.xml", {data: notice});
};

module.exports = FrontErr;