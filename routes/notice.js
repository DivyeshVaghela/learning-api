const config = require('../config/config');
const restifyErrors = require('restify-errors');
const auth = require('../auth');

const db = require('../models');
const Notice = db.Notice;
const User = db.User;

const allowedRolesAdmin = ['Admin'];
const allowedRolesAll = ['Admin','Learner'];

module.exports = (server) => {
  
    /**
     * /notice?
     *  details=true/false                  whether to include details of notice in response
     *  &detailsLimit=int                   length of the details to include in response
     *  &page=int                           page requested
     *  &pageSize=int                       records per page
     */
    server.get('/notice', (req, res, next) => {

        var attributes = ['id','title','created_at','updated_at'];

        var pageSize = 20;
        var page = 1;

        if (req.query != null){
            
            if (!req.query.hasOwnProperty('details') || (req.query.hasOwnProperty('details') && req.query.details != "false")){
                if (req.query.hasOwnProperty('detailsLimit')){
                    attributes.push([db.sequelize.fn('LEFT', db.sequelize.col('details'), req.query.detailsLimit), 'details']);
                }else{
                    attributes.push('details');
                }
            }

            if (req.query.hasOwnProperty('page')){
                var intPage = parseInt(req.query.page);
                if (!isNaN(intPage) && intPage > 0){
                    page = intPage;
                }
            }
            if (req.query.hasOwnProperty('pageSize')){
                var intPageSize = parseInt(req.query.pageSize);
                if (!isNaN(intPageSize) && intPageSize > 0){
                    pageSize = intPageSize;
                }
            }
        }
        
        Notice.findAndCountAll({
            attributes,
            include: [{
                model: User,
                as: 'postedBy',
                attributes: ['id','username','email']
            }],
            offset: (page - 1) * pageSize,
            limit: pageSize,
            order: [
                ['created_at', 'DESC']
            ]
        })
            .then(notices => {
                res.send(notices);
                next();
            }).catch(err => {
                next(new restifyErrors.InternalServerError(err));
            });
    });

    server.post('/notice', (req, res, next) => {

        if (!auth.authorize(req, allowedRolesAdmin)){
            next(new restifyErrors.ForbiddenError(auth.forbiddenMessage));
            return;
        }

        if (req.body == undefined 
            || !req.body.hasOwnProperty('title')
            || !req.body.hasOwnProperty('details')){

            next(new restifyErrors.InvalidArgumentError('Request does not have all the required arguments (title, details)'));
            return;
        }

        var { title, details } = req.body;

        Notice.create({
            title, 
            details, 
            postedByUserId: req.user.id
        }).then(notice => {
            res.send(201, notice);
            next();
        }).catch(err => {
            next(new restifyErrors.InternalServerError(err));
        });

    });
    
    server.get('/notice/:id', (req, res, next) => {

        Notice.findById(req.params.id, {
            attributes: ['id','title','details','isActive','created_at','updated_at'],
            include: [{
                model: User,
                as: 'postedBy',
                attributes: ['id','username','email']
            }]
        }).then(notice => {
            if (notice!=null){
                res.send(notice);
                next();
            } else {
                next(new restifyErrors.NotFoundError('Notice does not exists'));
            }
        }).catch(err => {
            next(new restifyErrors.InternalServerError(err));
        });
    });

};