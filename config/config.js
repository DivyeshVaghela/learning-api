'use strict';

module.exports = {
    PORT: process.env.PORT || 3000,
    JWT_SECRET: process.env.JWT_SECRET || 'secret',
    TOKEN_EXPIRES_IN: process.env.TOKEN_EXPIRES_IN || '60m'
};