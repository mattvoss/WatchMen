var redis = require('redis');

function ping (service, callback){

  var startTime = new Date(),
      timeout = service.host.timeout || 10000,
      subClient = redis.createClient(
        service.host.port,
        service.host.host
      ),
      callbackExecuted = false,
      setSubscription = function() {
        var timeoutCb = setTimeout(function () {
          callbackExecuted = true;
          subClient.unsubscribe();
          subClient.end();
          callback('Timeout (took more than ' + timeout +  ' ms)', null, null, null);
        }, timeout || 10000);
        subClient.subscribe(service.host.channel);
        subClient.on("message", function (channel, message) {
          clearTimeout(timeoutCb);
          subClient.unsubscribe();
          subClient.end();
          if (!callbackExecuted) {
            var timeDiff = (new Date() - startTime);
            callback(null, null, null, 0);
          }
        });
      };

  if (service.host.db) {
    subClient.select(
      service.host.db,
      function() {
        setSubscription();
      }
    );
  } else {
    setSubscription();
  }
}

module.exports.ping = ping;
