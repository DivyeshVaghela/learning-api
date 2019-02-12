const config = require('../config/config');
const restifyErrors = require('restify-errors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../auth');

const db = require('../models');
const User = db.User;
const Role = db.Role;

const allowedRolesAdmin = ['Admin'];

module.exports = (server) => {

    server.get('/admin/protected', (req, res, next) => {

        if (!auth.authorize(req, allowedRolesAdmin)){
            next(new restifyErrors.ForbiddenError(auth.forbiddenMessage));
            return;
        }

        res.send({
            message: 'Hello, ' + req.user.username
        });
        next();
    });

    server.post('/admin/auth', (req, res, next) => {

        if (req.body === undefined || !req.body.hasOwnProperty('email') || !req.body.hasOwnProperty('password')){
            next(new restifyErrors.InvalidArgumentError('email and password must be send with the request'));
        } else {

            const {email, password} = req.body;

            auth.authenticate(email, password, allowedRolesAdmin)
                .then(user => {

                    //generate token
                    const token = jwt.sign(user.toJSON(), config.JWT_SECRET, {
                        expiresIn: config.TOKEN_EXPIRES_IN
                    });
                    
                    const { iat, exp } = jwt.decode(token);

                    user.password = undefined;
                    user.id = undefined;

                    res.send({
                        success: true,
                        issuedAt: iat,
                        expire: exp,
                        token,
                        userProfile: user
                    });
                    next();
                })
                .catch(err => {
                    if (err === auth.forbiddenMessage)
                        next(new restifyErrors.ForbiddenError(err));
                    else
                        next(new restifyErrors.UnauthorizedError(err));
                });
        }
    });

};