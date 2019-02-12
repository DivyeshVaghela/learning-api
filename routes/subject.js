const config = require('../config/config');
const restifyErrors = require('restify-errors');
const mv = require('mv');
const fs = require('fs');
const mime = require('mime-types');
const auth = require('../auth');

const generalUtil = require('../util/generalUtil');

const db = require('../models/index');
const Subject = db.Subject;
const User = db.User;

const allowedRolesAdmin = ['Admin'];
const allowedLogoTypes = ['image/png', 'image/jpg', 'image/jpeg'];

module.exports = (server) => {

    /**
     * /subject?
     *  details=boolean             Whether to include subject details (default=false)
     *  detailsLimit=int            length of the details to include in response (applicable only when details=true)
     *  creator=boolean             Whether to include the user details who created this subject (default=false)
     *  onlyList=boolean            returns only the list of subjects
     */
    server.get('/subject', (req, res, next) => {

        var query = {};
        var attributes = [];
        
        if (req.query != null){

            if (req.query.hasOwnProperty('onlyList') && req.query.onlyList == 'true'){
                attributes = ['id','title'];
            } else {
                attributes = ['id','title','subtitle','logoPath','created_at','updated_at'];

                if (req.query.hasOwnProperty('creator') && req.query.creator == 'true'){
                    query.include = [{
                        model: User,
                        as: 'createdBy',
                        attributes: ['id','username','email']
                    }];
                }

                if (req.query.hasOwnProperty('details') && req.query.details == 'true'){

                    if (req.query.hasOwnProperty('detailsLimit') && !isNaN(req.query.detailsLimit)){
                        attributes.push([db.sequelize.fn('LEFT', db.sequelize.col('details'), parseInt(req.query.detailsLimit)), 'details']);
                    }else{
                        attributes.push('details');
                    }
                }
            }
        }

        query.attributes = attributes;
        query.order = [
            ['created_at', 'DESC']
        ];

        Subject.findAndCountAll(query)
            .then(subjects => {
                res.send(subjects);
                next();
            })
            .catch(err => {
                next(new restifyErrors.InternalServerError(err));
            });
    });

    server.post('/subject', (req, res, next) => {

        if (!auth.authorize(req, auth.allowedRolesAdmin)){
            next(new restifyErrors.ForbiddenError(auth.forbiddenMessage));
            return;
        }

        const hasLogo = req.files!=null && req.files.hasOwnProperty('logo');

        if (req.body == undefined
                || !req.body.hasOwnProperty('title')
                || !req.body.hasOwnProperty('subtitle')){
            next(new restifyErrors.InvalidArgumentError('Request does not have all the required arguments (title, subtitle)'));
            return;
        }

        if (hasLogo && allowedLogoTypes.indexOf(req.files.logo.type) == -1){
            next(new restifyErrors.InvalidArgumentError('Subject Logo must be a PNG or JPG file'));
            return;
        }

        console.log(req.body);

        const { title, subtitle, details } = req.body;
        generalUtil.stringToNullIfNull(subtitle);
        generalUtil.stringToNullIfNull(details);

        var logoPath = '/assets/public/images/app-logo.png';

        const makeSubjectDir = (subjectId) => {

            fs.mkdir(`./assets/material/${subjectId}`, { recursive:true }, (err) => {
                if (err){
                    next(new restifyErrors.InternalServerError(err));
                    return;
                }
            });
        };

        db.sequelize.transaction()
            .then(t => {

                return Subject.create({
                    title,
                    subtitle,
                    details,
                    logoPath,
                    createdByUserId: req.user.id
                }).then(subject => {
                    if (hasLogo){
                        logoPath = `/assets/public/images/subject/${subject.id}.${mime.extension(req.files.logo.type)}`;
                        mv(req.files.logo.path, __dirname + '/..' + logoPath, function(err){
                            if (err){
                                t.rollback();
                                next(new restifyErrors.InternalServerError(err));
                                return;
                            }

                            return subject.update({
                                logoPath : logoPath
                            }, {transaction:t})
                                .then(subject => {
                                    t.commit();
                                    makeSubjectDir(subject.id);
                                    res.send(201, subject);
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
                        makeSubjectDir(subject.id);
                        res.send(201, subject);
                        next();
                    }

                }).catch(err => {
                    removeLogo();
                    next(new restifyErrors.InternalServerError(err));
                    return;
                });

            })
            .catch(err => {
                next(new restifyErrors.InternalServerError(err));
            });
    });

    /**
     * /subject/id
     *  details=boolean             Whether to include subject details (default=true)
     *  detailsLimit=int            length of the details to include in response (applicable only when details=true)
     *  creator=boolean             Whether to include the user details who created this subject (default=false)
     */
    server.get('/subject/:id(^\\d+$)', (req, res, next) => {

        var query = {
            include: []
        };
        var attributes = ['id', 'title', 'subtitle', 'logoPath', 'created_at', 'updated_at'];

        if (req,query != null){

            //include creator
            if (req.query.hasOwnProperty('creator') && req.query.creator == 'true'){
                query.include.push({
                    model: User,
                    as: 'createdBy',
                    attributes: ['id','username','email']
                });
            }

            //fetch details
            if (!(req.query.hasOwnProperty('details') && req.query.details == 'false')){

                if (req.query.hasOwnProperty('detailsLimit') && !isNaN(req.query.detailsLimit)){
                    attributes.push([db.sequelize.fn('LEFT', db.sequelize.col('Subject.details'), parseInt(req.query.detailsLimit)), 'details']);
                }else{
                    attributes.push('details');
                }
            }
        }
        query.attributes = attributes;

        Subject.findByPk(req.params.id, query)
            .then(subject => {
                if (subject == null){
                    next(new restifyErrors.NotFoundError(`The resource you are trying to find is not available`));
                } else {
                    res.send(subject);
                    next();
                }
            })
            .catch(err => {
                next(new restifyErrors.InternalServerError(err));
            });

    });

    server.put('/subject/:id(^\\d+$)', (req, res, next) => {

        if (!auth.authorize(req, auth.allowedRolesAdmin)){
            next(new restifyErrors.ForbiddenError(auth.forbiddenMessage));
            return;
        }

        const hasLogo = req.files!=null && req.files.hasOwnProperty('logo');
        
        if (hasLogo && allowedLogoTypes.indexOf(req.files.logo.type) == -1){
            next(new restifyErrors.InvalidArgumentError('Subject Logo must be a PNG or JPG file'));
            return;
        }

        Subject.findByPk(req.params.id)
            .then(subject => {

                query = {};
                if (req.body.hasOwnProperty('title') && !generalUtil.isStringNull(req.body.title))
                    query.title = req.body.title;
                if (req.body.hasOwnProperty('subtitle') && !generalUtil.isStringNull(req.body.subtitle))
                    query.subtitle = req.body.subtitle;
                if (req.body.hasOwnProperty('details') && !generalUtil.isStringNull(req.body.details))
                    query.details = req.body.details;

                const update = () => {
                    subject.update(query)
                        .then(results => {
                            res.send(200);
                            next();
                        })
                        .catch(err => {
                            next(new restifyErrors.InternalServerError(err));
                            return;
                        });
                };

                if (hasLogo){
                    const logoPath = `/assets/public/images/subject/${req.params.id}.${mime.extension(req.files.logo.type)}`;
                    mv(req.files.logo.path, __dirname + '/..' + logoPath, function(err){
                        if (err){
                            next(new restifyErrors.InternalServerError(err));
                            return;
                        }

                        if (subject.logoPath != logoPath){
                            if (!subject.logoPath.endsWith('app-logo.png'))
                                fs.unlink(`${__dirname}/..${subject.logoPath}`, () => {});
                            query.logoPath = logoPath;
                        }
                        update();
                    });
                } else {
                    update();
                }

            })
            .catch(err => {
                next(new restifyErrors.InternalServerError(err));
            });
    });
};