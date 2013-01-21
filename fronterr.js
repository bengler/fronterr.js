var AirbrakeNotice = require("airbrake-notice");
var fronterr = require("../package");

function escapeXML(str) {
  return str.replace(/&/g, '&#38;')
    .replace(/</g, '&#60;')
    .replace(/>/g, '&#62;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&#34;');
}

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

FrontErr.prototype.createBaseNotice = function () {
  return {
    apiKey: 'API_KEY_FOR:' + this.app.name,
    notifier: {
      name: 'fronterr.js',
      version: fronterr.version,
      url: fronterr.homepage || (fronterr.repository && fronterr.repository.url) || ''
    },
    serverEnvironment: {
      name: this.environment || 'n/a',
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

FrontErr.prototype.createNotice = function (error) {
  var notice = this.createBaseNotice();
  notice.error = error;
  return this.notice.create(notice);
};

FrontErr.prototype.reportError = function (error) {
  return this.postNotice(this.createNotice(error));
};

FrontErr.prototype.postNotice = function (notice) {
  return this.service.post("/notifier_api/v2/notices.xml", {data: notice});
};

FrontErr.prototype.start = function () {
  var existingHandler = window.onerror;
  window.onerror = function(message, file, line) {
    if (existingHandler) existingHandler.apply(window, arguments);
    file || (file = "<unknown>");
    line || (line = 0);

    file = escapeXML(file);
    message = escapeXML(message);

    this.reportError({
      message: message,
      file: file,
      line: line,
      backtrace: [{method: escapeXML('<unknown>'), file: file, line: line}]
    });
  }.bind(this);
};

module.exports = FrontErr;