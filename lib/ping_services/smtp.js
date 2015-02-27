var SMTPConnection = require('smtp-connection');

function ping (service, callback){
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  var startTime = new Date(),
      timeout = service.host.timeout || 10000,
      options = {
        port: service.host.port,
        host: service.host.host,
        secure: service.host.secure || false,
        ignoreTLS: service.host.ignoreTLS || false,
        requireTLS: service.host.requireTLS || false,
        connectionTimeout: timeout
      },
      connection = new SMTPConnection(options),
      callbackExecuted = false;
  
  connection.connect(function() {
    if (!callbackExecuted) {
      var timeDiff = (new Date() - startTime);
      connection.quit();
      callback(null, null, null, timeDiff);
    }
  });

  connection.on("error", function (err) {
    if (!callbackExecuted) {
      connection.quit();
      callback("SMTP Error", null, null, null);
    }
    callbackExecuted = true;
  });

}

module.exports.ping = ping;
