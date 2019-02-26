const restifyErrors = require('restify-errors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const restifyJWT = require('restify-jwt-community');
const crypto = require('crypto');
const jsSHA = require('jssha');

const auth = require('../auth');
const config = require('../config/config');
const emailSender = require('../email/index');

const db = require('../models/index');
const User = db.User;
const Role = db.Role;
const Package = db.Package;
const UserPackage = db.UserPackage;
const Transaction = db.Transaction;
const Op = db.sequelize.Op;

const allowedRolesLearner = ['Learner'];
const allowedRolesAll = ['Admin', 'Learner'];

module.exports = (server) => {

    server.get('/user', (req, res, next) => {

        if (!auth.authorize(req, allowedRolesLearner)){
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

                                const verificationCode = crypto.randomBytes(10).toString('hex');
    
                                return db.sequelize.transaction()
                                    .then(t => {

                                        var user = null;

                                        return User.create({
                                            email,
                                            username,
                                            password,
                                            mobileNo,
                                            verificationCode
                                        }, { transaction:t })
                                        .then(entity => {
                                            user = entity;

                                            return Role.findOne({
                                                where: {
                                                    name: 'Learner'
                                                }
                                            });
                                        })
                                        .then(entity => {
                                            return user.setRoles([entity.id], { transaction:t });
                                        })
                                        .then(entity => {
                                            const to = user.email;
                                            const toUsername = user.username;
                                            const mailSubject = `Email Verification`;
                                            const html = `<h1>${config.APP_NAME}</h1><h3>Hello, ${user.username}</h3><p>Follow the below link to verify your email address.</p><p><a href="${config.WEB_APP.base_url}/#!/verify-email?email=${user.email}&code=${user.verificationCode}">Verify Email</a></p>`;

                                            return emailSender.sendMail(to, toUsername, mailSubject, html);
                                        })
                                        .then(info => {
                                            res.send({
                                                success: true,
                                                message: 'Verification email sent successfully'
                                            });
                                            t.commit();
                                            next();
                                        })
                                        .catch(err => {
                                            next(new restifyErrors.InternalServerError(err.message));
                                            t.rollback();
                                        });
                                    })
                                    .catch(err => {
                                        next(new restifyErrors.InternalServerError(err.message));
                                    });
                            })
                            .catch(err => {
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

    server.post('/user/verify-email', (req, res, next) => {

        if (req.body == undefined 
            || !req.body.hasOwnProperty('email') 
            || !req.body.hasOwnProperty('verificationCode')){

            next(new restifyErrors.InvalidArgumentError('Request does not have all the required arguments'));
            return;
        }

        const { email, verificationCode } = req.body;

        User.findOne({
            where: { email, verificationCode }
        })
        .then(user => {
            if (user == null){
                const err = new restifyErrors.NotFoundError(`The resource you'r trying to find doesn't exists.`);
                next(err);
                return new Promise((resolve, reject) => {
                    reject(err);
                });
            } else {
                return user.update({
                    verificationCode: null,
                    emailVerified: true
                });
            }
        })
        .then(user => {
            res.send(200, {
                success: true,
                message: 'Email address verified successfully'
            });
        })
        .catch(err => {
            next(new restifyErrors.InternalServerError(err));
        });

    });

    server.post('/user/auth', (req, res, next) => {

        if (req.body == undefined || !req.body.hasOwnProperty("email") || !req.body.hasOwnProperty("password")){
            next(new restifyErrors.InvalidArgumentError('email and password must be send with the request'));
        } else {

            const { email, password } = req.body;

            auth.authenticate(email, password, allowedRolesLearner)
                .then(user => {

                    if (!user.emailVerified){
                        next(new restifyErrors.BadRequestError('Email address is not verified, you can login after email verification is completed.'));
                        return;
                    }

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

    server.post('/user/auth/refresh', (req, res, next) => {

        console.log(`UserId = ${req.user.id}, Username = ${req.user.username}, email = ${req.user.email}`);

        var userFromDB = null;

        User.findOne({
            attributes: ['email', 'password'],
            where: {
                id: req.user.id,
                username: req.user.username,
                email: req.user.email
            }
        }).then(entity => {

            console.log(entity);

            if (entity == null){
                next(new restifyErrors.NotFoundError(`The resource doesn't exists`));
                return;
            }

            userFromDB = entity;

            auth.authenticate(userFromDB.email, userFromDB.password, allowedRolesLearner, true)
                .then(user => {

                    if (!user.emailVerified){
                        next(new restifyErrors.BadRequestError('Email address is not verified, you can login after email verification is completed.'));
                        return;
                    }

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


        }).catch(err => {
            next(new restifyErrors.InternalServerError(err));
        });

    });

    /**
     * /user/id?
     *  roles=boolean                   whether to include roles or not (default=true)
     *  package=boolean                 whether to include all packages or not (default=false)
     */
    server.get('/user/:id(^\\d+$)', (req, res, next) => {

        var query = {
            include: [],
            where: {}
        };
        var attributes = ['id', 'username', 'email', 'mobileNo', 'emailVerified', 'mobileNoVerified', 'created_at', 'updated_at'];
        var onlyActivePackage = { 
            isActive: true,
            validityStart:{
                [Op.lt]: db.Sequelize.fn('current_timestamp')
            },
            validityEnd:{
                [Op.gt]: db.Sequelize.fn('current_timestamp')
            }
        };
        var packageQuery = {
            model: Package,
            require: false,
            attributes: ['id', 'title', 'subtitle', 'duration', 'durationScale', 'rate', 'isActive', 'created_at', 'updated_at'],
            through: {
                attributes: ['id', 'validityStart', 'validityEnd', 'isActive'],
                order: [
                    ['validityStart', 'DESC']
                ]
            },
            order: [
                ['created_at', 'DESC']
            ]
        };

        if (req.query != null){

            if (req.query.hasOwnProperty('roles') && req.query.roles == 'true'){
                query.include.push({
                    model: Role,
                    require: true,
                    attributes: ['name'],
                    through: {
                        attributes: []
                    }
                });
            }

            // if (req.query.hasOwnProperty('packages')){
            //     if (req.query.packages == 'true')
            //         query.include.push(packageQuery);
            //     else if (req.query.packages != 'false'){
            //         packageQuery.through.where = onlyActivePackage;
            //         query.include.push(packageQuery);
            //     }
            // } else {
            //     packageQuery.through.where = onlyActivePackage;
            //     query.include.push(packageQuery);
            // }

            if (req.query.hasOwnProperty('package') && req.query.package == 'true'){
                packageQuery.through.where = onlyActivePackage;
                query.include.push(packageQuery);
            }
        }

        query.attributes = attributes;

        User.findByPk(req.params.id, query)
        .then(user => {

            res.send(200, user);
            next();
        }).catch(err => {
            next(new restifyErrors.InternalServerError(err));
        });

    });

    server.post('/user/forgot-password', (req, res, next) => {

        if (req.body == null 
            || !req.body.hasOwnProperty('email')){
            next(new restifyErrors.InvalidArgumentError('Request does not have all the required arguments'))
            return;
        }

        const { email } = req.body;

        User.findOne({
            where: { email }
        }).then(user => {
            if (user == null){
                const err = new restifyErrors.NotFoundError(`Invalid Email address`);
                next(err);
                return new Promise((resolve, reject) => {
                    reject(err);
                });
            }

            const verificationCode = crypto.randomBytes(10).toString('hex');

            return user.update({
                verificationCode
            });
        }).then(user => {

            console.log("updated user = ");
            console.log(user);

            const to = user.email;
            const toUsername = user.username;
            const mailSubject = `Forgot Password`;
            const html = `<h1>${config.APP_NAME}</h1><h3>Hello, ${user.username}</h3><p>Follow the below link to reset your password :</p><p><a href="${config.WEB_APP.base_url}/#!/reset-password?email=${user.email}&code=${user.verificationCode}">Verify Email</a></p>`;

            return emailSender.sendMail(to, toUsername, mailSubject, html);

        }).then(info => {
            res.send({
                success: true,
                message: `Please check your email (${email}), and follow the instructions to reset password`
            });
            next();
        }).catch(err => {
            next(new restifyErrors.InternalServerError(err));
        });
    });

    server.post('/user/reset-password', (req, res, next) => {

        if (req.body == undefined 
            || !req.body.hasOwnProperty('email') || req.body.email == null
            || !req.body.hasOwnProperty('password') || req.body.password == null
            || !req.body.hasOwnProperty('verificationCode') || req.body.verificationCode == null){

            next(new restifyErrors.InvalidArgumentError('Request does not have all the required arguments'));
            return;
        }

        var { email, verificationCode, password } = req.body;

        User.findOne({
            where: { email, verificationCode }
        })
        .then(user => {
            if (user == null){
                const err = new restifyErrors.NotFoundError(`The resource you'r trying to find doesn't exists.`);
                next(err);
                return new Promise((resolve, reject) => {
                    reject(err);
                });
            } else {

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(password, salt)
                        .then(hash => {

                            var query = {
                                verificationCode: null,
                                password: hash
                            };

                            if (!user.emailVerified){
                                query.emailVerified = true;
                            }

                            user.update(query)
                            .then(user => {
                                res.send(200, {
                                    success: true,
                                    message: 'Password reset successfully, you can login now by using new password'
                                });
                                next();
                            })
                            .catch(err => {
                                next(new restifyErrors.InternalServerError(err));
                            });
                        })
                        .catch(err => {
                            next(new restifyErrors.InternalServerError(err));
                        });
                });
            }
        })
        .catch(err => {
            next(new restifyErrors.InternalServerError(err));
        });
    });

    server.post('/user/change-password', (req, res, next) => {

        if (!auth.authorize(req, allowedRolesAll)){
            next(new restifyErrors.ForbiddenError(auth.forbiddenMessage));
            return;
        }

        if (req.body == undefined 
            || !req.body.hasOwnProperty('email') || req.body.email == null
            || !req.body.hasOwnProperty('currentPassword') || req.body.currentPassword == null
            || !req.body.hasOwnProperty('newPassword') || req.body.newPassword == null){

            next(new restifyErrors.InvalidArgumentError('Request does not have all the required arguments'));
            return;
        }

        const { email, currentPassword, newPassword } = req.body;

        auth.authenticate(email, currentPassword, allowedRolesAll)
            .then(user => {

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newPassword, salt)
                        .then(hash => {
                            user.update({
                                password: hash
                            })
                            .then(user => {
                                res.send(200, {
                                    success: true,
                                    message: 'Password changed successfully'
                                });
                                next();
                            })
                            .catch(err => {
                                next(new restifyErrors.InternalServerError(err));
                            });
                        })
                        .catch(err => {
                            next(new restifyErrors.InternalServerError(err));
                        });
                });
            })
            .catch(err => {
                if (err === auth.forbiddenMessage)
                    next(new restifyErrors.ForbiddenError(err));
                else
                    next(new restifyErrors.UnauthorizedError(err));
            });
    });

    /**
     * /user/id/package?
     *  transaction:boolean             Whether to include transaction or not (default=false)
     */
    server.get('/user/:id(^\\d+$)/package', (req, res, next) => {

        var query = {
            include: [
                {
                    model: Package,
                    require: true,
                    attributes: ['id', 'title', 'subtitle', 'details', 'duration', 'durationScale', 'rate', 'isActive', 'created_at', 'updated_at'],
                    as: 'package'
                }
            ],
            where: {
                userId: req.params.id,
                isActive: true,
                validityStart:{
                    [Op.lt]: db.Sequelize.fn('current_timestamp')
                },
                validityEnd:{
                    [Op.gt]: db.Sequelize.fn('current_timestamp')
                }
            }
        };
        var attributes = ['id','validityStart','validityEnd','isActive'];

        if (req.query != null){

            if (req.query.hasOwnProperty('transaction') && req.query.transaction == 'true'){
                query.include.push({
                    model: Transaction,
                    require: false,
                    attributes: ['id', 'txnId', 'title', 'details', 'amount', 'status', 'completionTime'],
                    as: 'transaction'
                });
            }
        }

        query.attributes = attributes;

        UserPackage.findOne(query)
            .then(userPackage => {

                if (userPackage == null){
                    next(new restifyErrors.NotFoundError(`The resource doesn't exists`));
                    return;
                }
                res.send(200, userPackage);
                next();

            }).catch(err => {
                next(new restifyErrors.InternalServerError(err));
            });
    });

    server.post('/user/package-purchase', (req, res, next) => {

        if (!auth.authorize(req, allowedRolesAll)){
            next(new restifyErrors.ForbiddenError(auth.forbiddenMessage));
            return;
        }

        if (req.body == undefined 
            || !req.body.hasOwnProperty('package') || req.body.package == null){

            next(new restifyErrors.InvalidArgumentError('Request does not have all the required arguments'));
            return;
        }

        var package = null;
        var user = null;

        UserPackage.findOne({
            where: {
                userId: req.user.id,
                isActive: true,
                validityStart:{
                    [Op.lt]: db.Sequelize.fn('current_timestamp')
                },
                validityEnd:{
                    [Op.gt]: db.Sequelize.fn('current_timestamp')
                }
            }
        }).then(entity => {

            if (entity == null){
                return Package.findByPk(req.body.package, {
                            attributes: ['id', 'title', 'subtitle', 'details', 'duration', 'durationScale', 'rate', 'isActive', 'created_at', 'updated_at'],
                            where: {
                                isActive: true
                            }
                        });
            }

            next(new restifyErrors.BadRequestError(`You are already a premium user, one user can  purchase another package after the first package is completed.`));
            return;

        }).then(entity => {

            if (entity == null){
                next(new restifyErrors.NotFoundError(`The resource you'r trying to find doesn't exists.`));
                return;
            }

            package = entity;
            return User.findByPk(req.user.id, {
                        attributes: ['id', 'username', 'email', 'mobileNo', 'emailVerified', 'mobileNoVerified', 'created_at', 'updated_at'],
                        where: {
                            isActive: true
                        }
                    });

        }).then(entity => {

            user = entity;
            const txnId = `JNJ${crypto.randomBytes(10).toString('hex')}`;

            /**
             * Hash Sequence
             * hashSequence = key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt
             */
            var hashString = config.PAYMENT.PayUMoney.KEY
                                + '|' + txnId
                                + '|' + parseFloat(package.rate).toFixed(2)
                                + '|' + package.title
                                + '|' + user.username
                                + '|' + user.email
                                + '|' + package.id                                      //udf1=packageId
                                + '|' + user.id                                         //udf2=userId
                                + '|' + '|' + '|' + '|' + '|' + '|' + '|' + '|'
                                + '|' + config.PAYMENT.PayUMoney.SALT;

            var sha = new jsSHA('SHA-512', 'TEXT');
            sha.update(hashString);
            var hash = sha.getHash('HEX');
            
            //save the transaction initiation
            Transaction.create({
                userId: user.id,
                txnId: txnId,
                title: package.title,
                details: `Purchase of ${package.title}, ${package.subtitle}`,
                amount: package.rate,
                packageId: package.id,
                status: 'pending',
                requestHash: hash
            }).then(transaction => {

                res.send({
                    txnId: txnId,
                    product: package,
                    customer: user,
                    key: config.PAYMENT.PayUMoney.KEY,
                    merchantId: config.PAYMENT.PayUMoney.MERCHANT_ID,
                    hash:hash
                });
                next();    
            }).catch(err => {
                next(new restifyErrors.InternalServerError(err));
            });

        }).catch(err => {
            next(new restifyErrors.InternalServerError(err));
        });

    });

    server.post('/user/package-purchase/success', (req, res, next) => {

        console.log('Success package-purchase');

        if (req.body != null){

            var transaction = null;

            Transaction.findOne({
                where: { txnId : req.body.txnid }
            }).then(entity => {

                if (entity != null){
                    transaction = entity;

                    return transaction.update({
                                status: req.body.status,
                                responseHash: req.body.hash,
                                response: JSON.stringify(req.body),
                                completionTime: db.sequelize.fn('CURRENT_TIMESTAMP')
                            });
                }

                next(new restifyErrors.NotFoundError(`The resource doesn't exists`));
                return;
            }).then(() => {

                if (req.body.status !== 'success'){
                    console.log('Not Success');
                    res.send(200);
                    next();
                    return;
                }

                return Package.findByPk(req.body.udf1, {
                            attributes: ['id', 'duration', 'durationScale']
                        });

            }).then(package => {

                return UserPackage.create({
                            userId: req.body.udf2,
                            packageId: req.body.udf1,
                            transactionId: transaction.id,
                            validityStart: db.sequelize.fn('CURRENT_TIMESTAMP'),
                            validityEnd: db.sequelize.fn('DATE_ADD', db.sequelize.fn('CURRENT_TIMESTAMP'), db.sequelize.literal(`INTERVAL ${package.duration} ${package.durationScale}`)),
                            isActive: true
                        });

            }).then(userPackage => {
                res.send(200);
                next();
            }).catch(err => {
                next(new restifyErrors.InternalServerError(err));
            });

        }

    });

    server.post('/user/package-purchase/failure', (req, res, next) => {

        console.log(req);

        if (req.body == null || !req.body.hasOwnProperty('txnid')){
            next(new restifyErrors.BadRequestError('All the required parameters are not present'));
            return;next
        }

        const transactionId = req.body.txnid;

        if (req.body.hasOwnProperty('status')){

            var transaction = null;

            //user canceled
            Transaction.findOne({
                where: {
                    txnId: transactionId
                }
            }).then(entity => {
                if (entity == null){
                    next(new restifyErrors.NotFoundError(`The resource doesn't exists`));
                    return;
                }

                transaction = entity;

                var query = {
                    status: req.body.status
                };
                if (req.body.hasOwnProperty('hash')){
                    query.responseHash = req.body.responseHash;
                    query.response = JSON.stringify(req.body);
                }
                query.completionTime = db.sequelize.fn('CURRENT_TIMESTAMP');

                return transaction.update(query);
            }).then(entity => {

                res.send(200, { success: false });
                next();

            }).catch(err => {
                next(new restifyErrors.InternalServerError(err));
            })
        } else {
            res.send(200);
            next();
        }
    });
};