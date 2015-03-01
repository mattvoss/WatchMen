var postmark = require ('./postmark'),
    nodemailer = require('nodemailer'),
    smtpTransport = require('nodemailer-smtp-transport'),
    config = require ('../../../config/general');

exports.sendEmail = function (to_list, subject, body, callback){
  console.log("sending e-mail");
  if (config.notifications.postmark) {
    console.log("sending postmark");
    postmark.sendEmail({
      'From' : config.notifications.from,
      'To': to_list.join(','),
      'Subject': subject,
      'TextBody': body }, config.notifications.postmark.api_key, function(err, data) {
        if (err) {
          console.error (err);
          if (callback) callback (err, null);
        } else {
          if (callback) callback (null,'Email sent successfully to ' + to_list.join(','));
        }
      });
  }

  if (config.notifications.nodemailer) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    console.log("sending nodemailer email");
    var transports = [];
    if (config.notifications.nodemailer.smtp) {
      var transporter = nodemailer.createTransport(smtpTransport(config.notifications.nodemailer.smtp))
      transports.push(transporter);
    }
    if (config.notifications.nodemailer.ses) {
      transports.push(nodemailer.createTransport("SES", config.notifications.nodemailer.ses));
    }

    transports.forEach(function(transport) {
      var replyTo = ("replyTo" in config.notifications) config.notifications.replyTo : config.notifications.from;
      transport.sendMail({
        from : config.notifications.from,
        to : to_list.join(','),
        replayTo: replyTo,
        subject : subject,
        text : body
      }, function(err, response) {
        if (err) {
          console.error (err);
          if (callback) callback (err, null);
        } else {
          if (callback) callback (null,'Email sent successfully to ' + to_list.join(','));
        }
      });
    });
  }
};
