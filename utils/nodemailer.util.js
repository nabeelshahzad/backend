const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "eesaltest123@gmail.com",
    pass: "ofwobyffqenzbsxd",
    // user: "forverifying17@gmail.com",
    // pass: "brecvohwjpanpgsx"
  },
  tls: {
    rejectUnauthorized: false,
  },
});

module.exports = {
  sendEmail: (mailOptions) =>
    new Promise((resolve, reject) => {
      mailOptions.from = "eesaltest123@gmail.com";
      // mailOptions.from = "forverifying17@gmail.com";

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) return reject(error);
        return resolve(info);
      });
    }),
};
