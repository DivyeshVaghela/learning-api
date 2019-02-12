const config = require('../config/config');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: config.EMAIL.host,
    port: config.EMAIL.port,
    secure: config.EMAIL.secure,
    auth: {
        user: config.EMAIL.emailAddress,
        pass: config.EMAIL.password
    }
});

module.exports.sendMail = sendMail = (to, toUsername, subject, html) => {

    return new Promise((resolve, reject) => {

        const toField = ((toUsername == null) ? '' : '"'+toUsername+'" ') + to;

        console.log(toField);

        transporter.sendMail({
            from: `"${config.EMAIL.username}" ${config.EMAIL.emailAddress}`,
            to: toField,
            subject: subject,
            html: html
        }, (err, info) => {
            if (err){
                console.log(err);
                return reject(err);
            }
            console.log(info);
            resolve(info);
        });
    });

};