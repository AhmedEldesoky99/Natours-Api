"use strict";

var nodemailer = require('nodemailer');

var sendEmail = function sendEmail(options) {
  var transporter, mailOptions;
  return regeneratorRuntime.async(function sendEmail$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          // 1) Create a transporter
          transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
              user: process.env.EMAIL_USERNAME,
              pass: process.env.EMAIL_PASSWORD
            }
          }); // 2) Define the email options

          mailOptions = {
            from: 'Jonas Schmedtmann <hello@jonas.io>',
            to: options.email,
            subject: options.subject,
            text: options.message // html:

          }; // 3) Actually send the email

          _context.next = 4;
          return regeneratorRuntime.awrap(transporter.sendMail(mailOptions));

        case 4:
        case "end":
          return _context.stop();
      }
    }
  });
};

module.exports = sendEmail;