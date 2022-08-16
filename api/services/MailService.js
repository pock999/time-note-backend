const _ = require('lodash');
const nodemailer = require('nodemailer');

module.exports = {
  async sendEmail(subject, content, reciever) {
    const transporter = nodemailer.createTransport({
      host: 'smtp.mail.yahoo.com',
      port: 465,
      service: 'yahoo',
      secure: false,
      auth: {
        user: config.mail.email, // generated ethereal user
        pass: config.mail.password, // generated ethereal password
      },
      logger: true,
    });

    const options = {
      from: config.mail.email,
      to: reciever.email,
      subject: subject,
      html: ``,
    };

    const info = await transporter.sendMail(options);
  },
};
