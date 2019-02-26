const config = require('../config/config');
const restifyErrors = require('restify-errors');
const auth = require('../auth');

const db = require('../models');
const Package = db.Package;
const User = db.User;

const allowedRolesAdmin = ['Admin'];
const allowedRolesAll = ['Admin','Learner'];

const durationScaleList = ['day', 'week', 'month', 'year'];

module.exports = (server) => {

    /**
     * /package?
     *  active=boolean              true to get active false for deactive and by default all (ADMIN only)
     *  creator=boolean             Whether to include the user details who created (and modified) this package (default=false)
     *  details=boolean             Whether to include package details (default=false)
     *  detailsLimit=int            length of the details to include in response (applicable only when details=true)
     */
    server.get('/package', (req, res, next) => {

        const isAdmin = auth.authorize(req, auth.allowedRolesAdmin);
        var query = {
            include: [],
            where: {}
        };
        var attributes = ['id', 'title', 'subtitle', 'duration', 'durationScale', 'rate', 'isActive'];

        if (req.query != null){

            if (req.query.hasOwnProperty('creator') && req.query.creator == 'true'){
                query.include.push({
                    model: User,
                    as: 'createdBy',
                    attributes: ['id','username','email']
                });
                query.include.push({
                    model: User,
                    as: 'modifiedBy',
                    attributes: ['id','username','email']
                });
            }

            if (req.query.hasOwnProperty('details') && req.query.details == 'true'){

                if (req.query.hasOwnProperty('detailsLimit') && !isNaN(req.query.detailsLimit)){
                    attributes.push([db.sequelize.fn('LEFT', db.sequelize.col('Package.details'), parseInt(req.query.detailsLimit)), 'details']);
                }else{
                    attributes.push('details');
                }
            }

            if (isAdmin && req.query.hasOwnProperty('active')){

                if (req.query.active == 'true'){
                    query.where.isActive = true;
                } else if (req.query.active == 'false'){
                    query.where.isActive = false;
                }
            }
        }

        if (!isAdmin){
            query.where.isActive = true;
        }

        query.attributes = attributes;
        if (isAdmin){
            query.order = [
                ['created_at', 'DESC']
            ];
        } else {
            query.order = [
                ['rate']
            ];
        }

        Package.findAndCountAll(query)
            .then(packages => {
                res.send(200, packages);
                next();
            })
            .catch(err => {
                next(new restifyErrors.InternalServerError(err));
            });

    });

    server.post('/package', (req, res, next) => {

        if (!auth.authorize(req, auth.allowedRolesAdmin)){
            next(new restifyErrors.ForbiddenError(auth.forbiddenMessage));
            return;
        }

        if (req.body == undefined
                || !req.body.hasOwnProperty('title')
                || !req.body.hasOwnProperty('subtitle')
                || !req.body.hasOwnProperty('duration')
                || !req.body.hasOwnProperty('durationScale')
                || !req.body.hasOwnProperty('rate')){

            next(new restifyErrors.InvalidArgumentError('Request does not have all the required arguments (title, subtitle, duration, durationScale, rate)'));
            return;
        } else if (durationScaleList.indexOf(req.body.durationScale) == -1){
            next(new restifyErrors.InvalidArgumentError('Invalid durationScale'));
            return;
        }

        const { title, subtitle, details, duration, durationScale, rate } = req.body;

        Package.findOne({
            where: { title: title }
        }).then(entity => {
            if (entity != null){
                next(new restifyErrors.BadRequestError('Package with the same title already exists'));
                return;
            }

            return new Promise((resolve, reject) => {
                resolve();
            });
        }).then(() => {

            return Package.create({
                title,
                subtitle,
                details,
                duration,
                durationScale,
                rate,
                creatorUserId: req.user.id
            });
        }).then(entity => {
            res.send(201, entity);
            next();
        }).catch(err => {
            next(new restifyErrors.InternalServerError(err));
        })
    });

    /**
     * /package/id?
     *  creator=boolean             Whether to include the user details who created (and modified) this package (default=false)
     *  details=boolean             Whether to include package details (default=true)
     */
    server.get('/package/:id(^\\d+$)', (req, res, next) => {

        const isAdmin = auth.authorize(req, auth.allowedRolesAdmin);
        var query = {
            where: {},
            include: []
        };
        var attributes = ['id', 'title', 'subtitle', 'duration', 'durationScale', 'rate', 'isActive'];

        if (req.query != null){

            if (!(req.query.hasOwnProperty('details') && req.query.details == 'false')){
                attributes.push('details');
            }

            if (req.query.hasOwnProperty('creator') && req.query.creator == 'true'){
                query.include.push({
                    model: User,
                    as: 'createdBy',
                    attributes: ['id','username','email']
                });
                query.include.push({
                    model: User,
                    as: 'modifiedBy',
                    attributes: ['id','username','email']
                });
            }
        }

        if (!isAdmin){
            query.where.isActive = true;
        }
        query.attributes = attributes;

        Package.findByPk(req.params.id, query)
            .then(package => {
                if (package == null){
                    next(new restifyErrors.NotFoundError(`The resource you are trying to find doesn't exists`))
                    return;
                }

                res.send(200, package);
                next();
            })
            .catch(err => {
                next(new restifyErrors.InternalServerError(err));
            });

    });

    server.put('/package/:id(^\\d+$)', (req, res, next) => {

        if (!auth.authorize(req, auth.allowedRolesAdmin)){
            next(new restifyErrors.ForbiddenError(auth.forbiddenMessage));
            return;
        }

        if (req.body == undefined
                || !req.body.hasOwnProperty('title')
                || !req.body.hasOwnProperty('subtitle')
                || !req.body.hasOwnProperty('duration')
                || !req.body.hasOwnProperty('durationScale')
                || !req.body.hasOwnProperty('rate')){

            next(new restifyErrors.InvalidArgumentError('Request does not have all the required arguments (title, subtitle, duration, durationScale, rate)'));
            return;
        } else if (durationScaleList.indexOf(req.body.durationScale) == -1){
            next(new restifyErrors.InvalidArgumentError('Invalid durationScale'));
            return;
        }

        const { title, subtitle, details, duration, durationScale, rate } = req.body;
        var package = null;

        Package.findOne({
            where: { title: title }
        }).then(entity => {
            if (entity == null){
                next(new restifyErrors.BadRequestError(`The resource doesn't exists`));
                return;
            }

            package = entity;
            return new Promise((resolve, reject) => {
                resolve();
            });
        }).then(() => {

            return package.update({
                        title, subtitle, details, duration, durationScale, rate,
                        modifierUserId: req.user.id
                    });
        }).then(entity => {

            res.send(200, entity);
            next();

        }).catch(err => {
            next(new restifyErrors.InternalServerError(err));
        })
    });
};