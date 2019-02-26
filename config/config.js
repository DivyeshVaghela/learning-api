'use strict';

const APP_NAME = 'Jan Jagruti';

const WEB_APP_HOST = `192.168.1.102`;                   //TODO: IP/domain for Web application
const WEB_APP_PORT = 8081;                              //TODO: port on which web application server is listening for

module.exports =  {
    APP_NAME: APP_NAME,
    VERSION: 2.0,

    PORT: process.env.PORT || 3000,
    JWT_SECRET: process.env.JWT_SECRET || 'secret',
    TOKEN_EXPIRES_IN: process.env.TOKEN_EXPIRES_IN || '60m',        //TODO: For how much time the Token will be valid

    EMAIL: {
        host: 'smtp.gmail.com',                                     //TODO: host for email exchange
        port: 587,                                                  //TODO: port for email
        secure: false,                                              //TODO: secure or not
        emailAddress: '***',               //TODO: change the email address to send the mail to users
        username: APP_NAME,
        password: '****'                                //TODO: place the email address password here
    },

    WEB_APP: {
        host: WEB_APP_HOST,
        port: WEB_APP_PORT,
        base_url: `http://${WEB_APP_HOST}:${WEB_APP_PORT}`
    },

    //TODO: change the payment related parameters
    PAYMENT: {
        PayUMoney: {
            MERCHANT_ID: '******',
            KEY: '********',                                        //TEST
            SALT: '**********'                                      //TEST
        }
    }
};