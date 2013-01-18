var stacktrace = require("stacktrace-js");
var AirbrakeNotice = require("airbrake-notice");

function FrontErr(opts) {
  opts || (opts = {});
  if (!opts.service) throw Error("Please provide a FrontErr service endpoint");
  if (!opts.version) throw Error("Please provide a Airbrake API version");

  this.service = opts.service;
  this.notice = new AirbrakeNotice(opts.version);
}

FrontErr.prototype.createNotice = function(error) {

  this.notice.create({

  });
};
FrontErr.prototype.reportError = function(error) {
  return this.sendNotice(this.createNotice(error));
};
FrontErr.prototype.sendNotice = function(notice) {
  this.service.post("/notifier_api/v2/notices.xml", {notice: this.notice.create(error)});
};