const _ = require('lodash');
const nodemailer = require('nodemailer');

module.exports = {
  async sendEmail(subject, content, reciever) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      auth: {
        user: config.mail.email, // generated ethereal user
        pass: config.mail.password, // generated ethereal password
      },
      secure: false,
      logger: true,
    });

    const options = {
      from: config.mail.email,
      to: reciever.email,
      subject: subject,
      html: content,
    };

    const info = await transporter.sendMail(options);
  },
};
