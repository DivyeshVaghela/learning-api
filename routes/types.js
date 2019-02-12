const config = require('../config/config');
const restifyErrors = require('restify-errors');
const auth = require('../auth');
const generalUtil = require('../util/generalUtil');
const fs = require('fs');
const mv = require('mv');
const mime = require('mime-types');

const db = require('../models/index');
const User = db.User;
const MimeType = db.MimeType;

const allowedLogoTypes = ['image/png', 'image/jpg', 'image/jpeg'];

module.exports = (server) => {

    /**
     * /type?
     *  onlyList=boolean            returns only the list of subjects
     */
    server.get('/type', (req, res, next) => {

        var query = {};

        if (req.query.hasOwnProperty('onlyList') && req.query.onlyList == 'true'){
            query.attributes = ['id','name', 'value'];
        }

        query.order = [
            ['value']
        ];
        MimeType.findAndCountAll(query)
            .then(types => {
                res.send(types);
                next();
            })
            .catch(err => {
                next(new restifyErrors.InternalServerError(err));
            });
    });

    server.post('/type', (req, res, next) => {

        if (!auth.authorize(req, auth.allowedRolesAdmin)){
            next(new restifyErrors.ForbiddenError(auth.forbiddenMessage));
            return;
        }

        if (req.body == undefined
                || !req.body.hasOwnProperty('name')
                || !req.body.hasOwnProperty('value')){

            next(new restifyErrors.InvalidArgumentError('Request does not have all the required arguments (name, value)'));
            return;
        }
        
        const hasLogo = req.files!=null && req.files.hasOwnProperty('logo');

        if (hasLogo && allowedLogoTypes.indexOf(req.files.logo.type) == -1){
            next(new restifyErrors.InvalidArgumentError('Type Logo must be a PNG or JPG file'));
            return;
        }

        const { name, value, details } = req.body;

        MimeType.findOne({
            where: {name}
        }).then(type => {

            return new Promise((resolve, reject) => {
                if (type == null){
                    resolve();
                } else {
                    next(new restifyErrors.BadRequestError('Type with specified name already present'));
                    return;
                }
            });
        }).then(()=>{
            var logoPath = '/assets/public/images/app-logo.png';
            
            return db.sequelize.transaction()
                .then(t => {

                    MimeType.create({
                        name,
                        value,
                        details,
                        logoPath,
                        createdByUserId: req.user.id
                    }, {transaction:t})
                    .then(type => {

                        if (hasLogo){
                            logoPath = `/assets/public/images/types/${type.id}.${mime.extension(req.files.logo.type)}`;
                            mv(req.files.logo.path, __dirname + '/..' + logoPath, function(err){
                                if (err){
                                    t.rollback();
                                    next(new restifyErrors.InternalServerError(err));
                                    return;
                                }

                                type.update({
                                    logoPath: logoPath
                                }, {transaction:t})
                                    .then(type => {
                                        t.commit();
                                        res.send(201, type);
                                        next();
                                    })
                                    .catch(err => {
                                        t.rollback();
                                        next(new restifyErrors.InternalServerError(err));
                                        return;
                                    });
                            });

                        } else {
                            t.commit();
                            res.send(201, type);
                            next();
                        }
                    }).catch(err => {
                        t.rollback();
                        next(new restifyErrors.InternalServerError(err));
                    });
                    
                })
                .catch(err => {
                    next(new restifyErrors.InternalServerError(err));
                });
        }).catch(err => {
            next(new restifyErrors.InternalServerError(err));
        })
    });

    server.get('/type/:id(^\\d+$)', (req, res, next) => {

        MimeType.findByPk(req.params.id)
            .then(type => {
                if (type == null){
                    next(new restifyErrors.NotFoundError(`The resource you'r trying to find doesn't exists`));
                    return;
                }
                res.send(200, type);
                next();
            })
            .catch(err => {
                next(new restifyErrors.InternalServerError(err));
            });
    });

    server.put('/type/:id(^\\d+$)', (req, res, next) => {

        if (!auth.authorize(req, auth.allowedRolesAdmin)){
            next(new restifyErrors.ForbiddenError(auth.forbiddenMessage));
            return;
        }

        const hasLogo = req.files!=null && req.files.hasOwnProperty('logo');

        if (hasLogo && allowedLogoTypes.indexOf(req.files.logo.type) == -1){
            next(new restifyErrors.InvalidArgumentError('Type Logo must be a PNG or JPG file'));
            return;
        }

        MimeType.findByPk(req.params.id)
            .then(type => {

                var query = {};
                if (req.body.hasOwnProperty('name') && !generalUtil.isStringNull(req.body.name))
                    query.name = req.body.name;
                if (req.body.hasOwnProperty('value') && !generalUtil.isStringNull(req.body.value))
                    query.value = req.body.value;
                if (req.body.hasOwnProperty('details') && !generalUtil.isStringNull(req.body.details))
                    query.details = req.body.details;
                
                const update = () => {
                    type.update(query)
                        .then(type => {
                            res.send(200, type);
                            next();
                        })
                        .catch(err => {
                            next(new restifyErrors.InternalServerError(err));
                            return;
                        });
                };

                if (hasLogo){
                    const logoPath = `/assets/public/images/types/${type.id}.${mime.extension(req.files.logo.type)}`;
                    mv(req.files.logo.path, __dirname + '/..' + logoPath, function(err){
                        if (err){
                            next(new restifyErrors.InternalServerError(err));
                            return;
                        }

                        if (type.logoPath != logoPath){
                            if (!type.logoPath.endsWith('app-logo.png')){
                                fs.unlink(`${__dirname}/..${type.logoPath}`, () => {});
                            }
                            query.logoPath = logoPath;
                        }
                        update();
                    });
                } else {
                    update();
                }
            })
            .catch(err => {
                next(new restifyErrors.NotFoundError(`The resource you'r trying to find doesn't exists`));
                return;
            })

    });

};