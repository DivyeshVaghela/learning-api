const restifyErrors = require('restify-errors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const restifyJWT = require('restify-jwt-community');
const auth = require('../auth');
const config = require('../config/config');

const db = require('../models/index');
const User = db.User;
const Role = db.Role;

const allowedRoles = ['Learner'];

module.exports = (server) => {

    server.get('/user', (req, res, next) => {

        if (!auth.authorize(req, allowedRoles)){
            next(new restifyErrors.ForbiddenError(auth.forbiddenMessage));
            return;
        }

        User.findAll({
            attributes: ['id', 'username', 'email', 'mobileNo'],
            include: [{
                model: Role,
                required: false,
                attributes: ['name'],
                through: {
                    attributes: []
                }
            }]
        }).then(users => {
            res.send(users);
            next();
        })
        .catch(err => {
            console.log(err);
            next(new restifyErrors.InternalError(err.message));
        });
    });

    server.post('/user/register', (req, res, next) => {

        if (req.body == undefined 
            || !req.body.hasOwnProperty('email') 
            || !req.body.hasOwnProperty('username') 
            || !req.body.hasOwnProperty('password')
            || !req.body.hasOwnProperty('mobileNo')){

            next(new restifyErrors.InvalidArgumentError('Request does not have all the required arguments'));
        } else {

            var { email, username, password, mobileNo } = req.body;

            var errorResponce = {};
            errorResponce.fieldErrors = {};

            //check for unique email
            var isUniqueEmail = true;
            var isUniqueUsername = true;
            var isUniqueMobileNo = true;

            User.count({
                where: { email:email }
            }).then(count => {

                if (count != 0){
                    isUniqueEmail = false;
                    errorResponce.success = false;
                    errorResponce.fieldErrors.email = 'This email address is already registered';
                }

                return new Promise((resolve, reject) => {
                    resolve(isUniqueEmail);
                });

            }).then(isUniqueEmail => {

                return User.count({
                    where: { username:username }
                });
            }).then(usernameCount => {

                if (usernameCount != 0){
                    isUniqueUsername = false;
                    errorResponce.success = false;
                    errorResponce.fieldErrors.username = 'This username is already registered';
                }

                return new Promise((resolve, reject) => {
                    resolve(isUniqueUsername);
                });
            }).then(isUniqueUsername => {

                return User.count({
                    where: {mobileNo:mobileNo}
                });
            }).then(mobileNoCount => {

                if (mobileNoCount != 0){
                    isUniqueMobileNo = false;
                    errorResponce.success = false;
                    errorResponce.fieldErrors.mobileNo = 'This mobile number is already registered';
                }

                return new Promise((resolve, reject) => {
                    resolve(isUniqueMobileNo);
                });
            })
            .then(isUniqueMobileNo => {

                if ( !(isUniqueEmail && isUniqueUsername && isUniqueMobileNo)){
                    res.send(errorResponce);
                    next();
                }
                else {
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(password, salt)
                            .then(hash => {
    
                                password = hash;
    
                                return User.create({
                                    email,
                                    username,
                                    password,
                                    mobileNo
                                });
                            }).then(user => {
                                res.send({
                                    success: true
                                });
                                next();
                            }).catch(err => {
                                next(new restifyErrors.InternalServerError(err.message));
                            });
                    });
                }
            })
            .catch(err => {
                next(new restifyErrors.InternalServerError(err.message));
            });

        }
    });

    server.post('/user/auth', (req, res, next) => {

        if (req.body == undefined || !req.body.hasOwnProperty("email") || !req.body.hasOwnProperty("password")){
            next(new restifyErrors.InvalidArgumentError('email and password must be send with the request'));
        } else {

            const { email, password } = req.body;

            auth.authenticate(email, password, 'Learner')
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