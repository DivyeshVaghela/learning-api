const config = require('../config/config');
const restifyErrors = require('restify-errors');
const fs = require('fs');
const mv = require('mv');
const mime = require('mime-types');

const auth = require('../auth');
const generalUtil = require('../util/generalUtil');

const db = require('../models/index');
const User = db.User;
const Subject = db.Subject;
const MimeType = db.MimeType;
const Material = db.Material;

module.exports = (server) => {

    /**
     * /material?
     *  subjectId=int               filter for subject (if not preset then all the subject materials will be given)
     *  details=boolean             Whether to include subject details (default=false)
     *  detailsLimit=int            length of the details to include in response (applicable only when details=true)
     *  creator=boolean             Whether to include the user details who created this subject (default=false)
     *  type=boolean                Whether to include the user details who created this subject (default=true)
     *  page=int                    page requested
     *  pageSize=int                records per page
     */
    server.get('/material', (req, res, next) => {

        var query = {
            include: [],
            where: {}
        };
        var attributes = ['id','subjectId','title','subtitle','typeId','path', 'created_at', 'updated_at'];

        var pageSize = 20;
        var page = 1;

        if (req.query != null){

            if (req.query.hasOwnProperty('creator') && req.query.creator == 'true'){
                query.include.push({
                    model: User,
                    as: 'createdBy',
                    attributes: ['id','username','email']
                });
            }

            if (!(req.query.hasOwnProperty('type') && req.query.type == 'false')){
                query.include.push({
                    model: MimeType,
                    as: 'type',
                    attributes: ['id', 'name', 'value', 'logoPath']
                });
            }

            if (req.query.hasOwnProperty('details') && req.query.details == 'true'){

                if (req.query.hasOwnProperty('detailsLimit') && !isNaN(req.query.detailsLimit)){
                    attributes.push([db.sequelize.fn('LEFT', db.sequelize.col('Material.details'), parseInt(req.query.detailsLimit)), 'details']);
                }else{
                    attributes.push('details');
                }
            }

            if (req.query.hasOwnProperty('page') && !isNaN(req.query.page)){
                var intPage = parseInt(req.query.page);
                if (intPage > 0){
                    page = intPage;
                }
            }
            if (req.query.hasOwnProperty('pageSize') && !isNaN(req.query.pageSize)){
                var intPageSize = parseInt(req.query.pageSize);
                if (intPageSize > 0){
                    pageSize = intPageSize;
                }
            }

            //filter for subject
            if (req.query.hasOwnProperty('subjectId') && !isNaN(req.query.subjectId)){
                query.where.subjectId = parseInt(req.query.subjectId);
            }
        }

        query.attributes = attributes;
        query.order = [
            ['created_at', 'DESC']
        ];
        query.offset = (page - 1) * pageSize;
        query.limit = pageSize;

        Material.findAndCountAll(query)
            .then(materials => {
                res.send(materials);
                next();
            })
            .catch(err => {
                next(new restifyErrors.InternalServerError(err));
            })
    });

    server.post('/material', (req, res, next) => {

        if (!auth.authorize(req, auth.allowedRolesAdmin)){
            next(new restifyErrors.ForbiddenError(auth.forbiddenMessage));
            return;
        }

        if (req.body == undefined
                || !req.body.hasOwnProperty('title')
                || !req.body.hasOwnProperty('subtitle')
                || !req.body.hasOwnProperty('subjectId')
                || !req.body.hasOwnProperty('typeId')
                || !req.files.hasOwnProperty('materialFile')){

            next(new restifyErrors.InvalidArgumentError('Request does not have all the required arguments (title, subtitle, material)'));
            return;
        }

        const { title, subtitle, details, subjectId, typeId } = req.body;
        var subject = null;
        var type = null;

        Subject.findById(subjectId, {
            attributes: ['title']
        }).then(entity => {
            //check whether subject is valid

            if (entity == null){
                next(new restifyErrors.BadRequestError('Mentioned subject is invalid'));
                return;
            }
            subject = entity;

            return new Promise((resolve, reject)=>{
                resolve();
            });
        }).then(() => {
            //get the MimeType from DB

            return MimeType.findById(typeId, {
                attributes: ['name', 'value']
            });
        }).then(entity => {
            //check whether MimeType is valid
            
            if (entity == null){
                next(new restifyErrors.BadRequestError('Mentioned material type is invalid'));
                return;
            }
            type = entity;

            return new Promise((resolve, reject) => {
                resolve();
            });
        }).then(() => {
            //check whether the file is of proper type

            const materialExt = req.files.materialFile.name.split('.').pop();
            
            if (type.value != req.files.materialFile.type ){
                next(new restifyErrors.BadRequestError('Invalid file type'));
                return;
            }
            else if (req.files.materialFile.type=='image/jpeg'){
                if (!(materialExt == 'jpg' || materialExt == 'jpeg')){
                    next(new restifyErrors.BadRequestError('Invalid file type'));
                    return;
                }
            } else if (req.files.materialFile.name.split('.').pop() != mime.extension(type.value)) {
                next(new restifyErrors.BadRequestError('Invalid file type'));
                return;
            }


            //new code

            return db.sequelize.transaction()
                .then((t) => {
                    return Material.create({
                        title, 
                        subtitle,
                        details,
                        subjectId, 
                        typeId,
                        createdByUserId: req.user.id,
                        path: '/assets/public/app-logo.jpg'
                    }, { transaction : t})
                    .then(material => {
                        const materialPath = `/assets/material/${subjectId}/${material.id}.${mime.extension(type.value)}`;

                        mv(req.files.materialFile.path, `${__dirname}/..${materialPath}`, err => {
                            if (err){
                                t.rollback();
                                next(new restifyErrors.InternalServerError(err));
                                return;
                            }

                            material.path = materialPath;
                            material.update({
                                path: materialPath
                            }, {transaction: t})
                            .then(() => {
                                t.commit();
                                res.send(201, material);
                            })
                            .catch(err => {
                                fs.unlink(materialPath);
                                t.rollback();
                                next(new restifyErrors.InternalServerError(err));
                                return;
                            });
                        })
                    });
                });

            //END new code

            // const materialPath = `/assets/material/${subjectId}/${generalUtil.toSafeFileSystemName(title)}.${mime.extension(type.value)}`;

            // const removeFile = () => {
            //     fs.access(materialPath, fs.constants.W_OK, err => {
            //         if (!err)
            //             fs.unlink(materialPath);
            //     });
            // };

            // const save = () => {
            //     Material.create({
            //         title, 
            //         subtitle,
            //         details,
            //         subjectId, 
            //         typeId,
            //         createdByUserId: req.user.id,
            //         path: materialPath
            //     }).then(material => {
            //         res.send(201, material);
            //     }).catch(err => {
            //         removeFile();
            //         next(new restifyErrors.InternalServerError(err));
            //     });
            // };

            // mv(req.files.materialFile.path, `${__dirname}/..${materialPath}`, err => {
            //     if (err){
            //         next(new restifyErrors.InternalServerError(err));
            //         return;
            //     }
            //     save();
            // })

        }).catch(err => {
            next(new restifyErrors.InternalServerError(err));
        });

    });

    /**
     * /material/id?
     *  details=boolean             Whether to include subject details (default=true)
     *  detailsLimit=int            length of the details to include in response (applicable only when details=true)
     *  creator=boolean             Whether to include the user details who created this subject (default=false)
     *  subject=boolean             Whether to include the subject details who created this subject (default=false)
     *  type=boolean                Whether to include the user details who created this subject (default=true)
     */
    server.get('/material/:id(^\\d+$)', (req, res, next) => {
        
        var query = {
            include: []
        };
        var attributes = ['id','subjectId','title','subtitle','typeId','path', 'created_at', 'updated_at'];

        if (req.query != null){

            //include creator
            if (req.query.hasOwnProperty('creator') && req.query.creator == 'true'){
                query.include.push({
                    model: User,
                    as: 'createdBy',
                    attributes: ['id','username','email']
                });
            }

            //include type
            if (!(req.query.hasOwnProperty('type') && req.query.type == 'false')){
                query.include.push({
                    model: MimeType,
                    as: 'type',
                    attributes: ['id', 'name', 'value', 'logoPath']
                });
            }

            //include subject
            if (req.query.hasOwnProperty('subject') && req.query.subject == 'true'){
                query.include.push({
                    model: Subject,
                    as: 'subject',
                    attributes: ['id', 'title', 'subtitle', 'logoPath']
                });
            }

            //fetch details
            if (!(req.query.hasOwnProperty('details') && req.query.details == 'false')){

                if (req.query.hasOwnProperty('detailsLimit') && !isNaN(req.query.detailsLimit)){
                    attributes.push([db.sequelize.fn('LEFT', db.sequelize.col('Material.details'), parseInt(req.query.detailsLimit)), 'details']);
                }else{
                    attributes.push('details');
                }
            }
        }
        query.attributes = attributes;
        
        Material.findByPk(req.params.id, query)
            .then(material => {
                if (material == null)
                    next(new restifyErrors.NotFoundError(`The resource you are trying to find is not available`));
                else{
                    res.send(material);
                    next();
                }
            })
            .catch(err => {
                next(new restifyErrors.InternalServerError(err));
            })
    });


    /**
     * /subject/subjectId/materials?
     *  details=boolean             Whether to include subject details (default=false)
     *  detailsLimit=int            length of the details to include in response (applicable only when details=true)
     *  creator=boolean             Whether to include the user details who created this subject (default=false)
     *  subject=boolean             Whether to include the subject details who created this subject (default=true)
     *  type=boolean                Whether to include the user details who created this subject (default=true)
     *  page=int                    page requested (default=1)
     *  pageSize=int                records per page (default=20)
     */
    server.get('/subject/:subjectId(^\\d+$)/materials', (req, res, next) => {

        var query = {
            include: []
        };
        var attributes = ['id', 'title', 'subtitle', 'subjectId', 'typeId', 'path', 'created_at', 'updated_at'];
        var subjectAttributes = [];

        var pageSize = 20;
        var page = 1;

        if (req.query != null){

            //include creator
            if (req.query.hasOwnProperty('creator') && req.query.creator == 'true'){
                query.include.push({
                    model: User,
                    as: 'createdBy',
                    attributes: ['id','username','email']
                });
            }

            //include type
            if (!(req.query.hasOwnProperty('type') && req.query.type == 'false')){
                query.include.push({
                    model: MimeType,
                    as: 'type',
                    attributes: ['id', 'name', 'value', 'logoPath']
                });
            }

            //include subject
            if (!(req.query.hasOwnProperty('subject') && req.query.subject == 'false')){
                subjectAttributes.push('title', 'subtitle', 'logoPath');
            }

            //fetch details
            if (!(req.query.hasOwnProperty('details') && req.query.details == 'false')){

                if (req.query.hasOwnProperty('detailsLimit') && !isNaN(req.query.detailsLimit)){
                    attributes.push([db.sequelize.fn('LEFT', db.sequelize.col('Material.details'), parseInt(req.query.detailsLimit)), 'details']);
                }else{
                    attributes.push('details');
                }
            }

            //page
            if (req.query.hasOwnProperty('page') && !isNaN(req.query.page)){
                var intPage = parseInt(req.query.page);
                if (intPage > 0){
                    page = intPage;
                }
            }

            //pageSize
            if (req.query.hasOwnProperty('pageSize') && !isNaN(req.query.pageSize)){
                var intPageSize = parseInt(req.query.pageSize);
                if (intPageSize > 0){
                    pageSize = intPageSize;
                }
            }
        }
        
        query.attributes = attributes;
        var includeSubject = {
            model: Subject,
            as: 'subject',
            attributes: subjectAttributes,
            where: { id: req.params.subjectId }
        };
        query.include.push(includeSubject);
        query.offset = (page - 1) * pageSize;
        query.limit = pageSize;
        query.order = [
            ['created_at', 'DESC']
        ];

        Material.findAndCountAll(query)
            .then(materials => {
                res.send(materials);
                next();
            })
            .catch(err => {
                next(new restifyErrors.InternalServerError(err));
            });
    })

    server.put('/material/:id(^\\d+$)', (req, res, next) => {

        if (!auth.authorize(req, auth.allowedRolesAdmin)){
            next(new restifyErrors.ForbiddenError(auth.forbiddenMessage));
            return;
        }

        const { title, subtitle, details, subjectId, typeId } = req.body;
        var query = { title, subtitle, details, subjectId, typeId };

        if (req.body == undefined
            || !req.body.hasOwnProperty('title')
            || !req.body.hasOwnProperty('subtitle')
            || !req.body.hasOwnProperty('subjectId')){

            next(new restifyErrors.InvalidArgumentError('Request does not have all the required arguments (title, subtitle)'));
            return;
        }

        const hasMaterial = req.files != null && req.files.hasOwnProperty('materialFile');              //check if materialFile exists

        //new code

        var materialFromDB = null;
        var type = null;
        var isSubjectChanged = false;

        const proceedToSave = () => {
            Material.findByPk(req.params.id)
                .then(entity => {
                    materialFromDB = entity;

                    return new Promise((resolve, reject) => {
                        resolve();
                    });
                })
                .then(() => {

                    isSubjectChanged = (materialFromDB.subjectId != subjectId);
                    console.log(`materialFromDB.subjectId = ${materialFromDB.subjectId}, subjectId = ${subjectId}, isSubjectChanged = ${materialFromDB.subjectId != subjectId}`);

                    return db.sequelize.transaction()
                        .then(t => {
                            return materialFromDB.update(query, { transaction : t })                        //update the database record
                                .then(entity => {

                                    if (hasMaterial){

                                        const materialPath = `/assets/material/${subjectId}/${materialFromDB.id}.${mime.extension(type.value)}`;

                                        mv(req.files.materialFile.path, `${__dirname}/..${materialPath}`, err => {                  //save the new file
                                            if (err){
                                                t.rollback();
                                                next(new restifyErrors.InternalServerError(err));
                                                return;
                                            }

                                            if (materialFromDB.path != materialPath){

                                                fs.unlink(`${__dirname}/..${materialFromDB.path}`, () => {});                                 //remove old file
                                                
                                                materialFromDB.update({
                                                    path: materialPath
                                                }, {transaction:t})
                                                    .then(entity => {
                                                        t.commit();
                                                        res.send(entity);
                                                        next();
                                                    })
                                                    .catch(err => {
                                                        t.rollback();
                                                        next(new restifyErrors.InternalServerError(err));
                                                        return;
                                                    });
                                            } else {
                                                t.commit();
                                                res.send(entity);
                                                next();
                                            }
                                        });
                                    } else if (isSubjectChanged){

                                        console.log('Subject changed');

                                        const oldMaterialPath = materialFromDB.path;
                                        var splittedPath = oldMaterialPath.split('/');
                                        splittedPath[3] = subjectId;
                                        const newMaterialPath = splittedPath.join('/');

                                        mv(`${__dirname}/..${oldMaterialPath}`, `${__dirname}/..${newMaterialPath}`, err => {
                                            if (err){
                                                t.rollback();
                                                next(new restifyErrors.InternalServerError(err));
                                                return;
                                            }

                                            fs.unlink(`${__dirname}/..${oldMaterialPath}`, () => {});                                 //remove old file
                                            materialFromDB.update({
                                                path: newMaterialPath
                                            }, {transaction:t})
                                                .then(entity => {
                                                    t.commit();
                                                    res.send(entity);
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
                                        res.send(entity);
                                        next();
                                    }
                                });
                        });
                })
                .catch(err => {
                    next(new restifyErrors.InternalServerError(err));
                    return;
                });
        }

        if (hasMaterial){

            if (!req.body.hasOwnProperty('typeId')){
                next(new restifyErrors.InvalidArgumentError('Request does not have all the required arguments (type)'));
                return;
            }

            MimeType.findByPk(typeId, {
                attributes: ['name', 'value']
            })
            .then(entity => {
    
                if (entity == null){
                    next(new restifyErrors.InvalidArgumentError('Mentioned material type is invalid'));
                    return;
                } else {
                    type = entity;

                    const materialExt = req.files.materialFile.name.split('.').pop();

                    if (type.value != req.files.materialFile.type ){
                        next(new restifyErrors.InvalidArgumentError('Invalid file type'));
                        return;
                    }
                    else if (req.files.materialFile.type=='image/jpeg'){
                        if (!(materialExt == 'jpg' || materialExt == 'jpeg')){
                            next(new restifyErrors.InvalidArgumentError('Invalid file type'));
                            return;
                        } else {
                            proceedToSave();
                        }
                    } else if (req.files.materialFile.name.split('.').pop() != mime.extension(type.value)) {
                        next(new restifyErrors.InvalidArgumentError('Invalid file type'));
                        return;
                    } else {
                        proceedToSave();
                    }
                }
            })
        } else {
            proceedToSave();
        }

        //END new code

        // const save = () => {
        //     Material.findByPk(req.params.id)
        //         .then(material => {

        //             if (material == null){
        //                 next(new restifyErrors.NotFoundError(`The resource you are trying to update doesn't exists`));
        //                 return;
        //             }
        //             return material.update(query);
        //         })
        //         .then(material => {
        //             console.log(material);
        //             res.send(material);
        //         })
        //         .catch(err => {
        //             next(new restifyErrors.InternalServerError(err));
        //         });
        // };

        // if (hasMaterial){

        //     MimeType.findByPk(typeId, {
        //         attributes: ['name', 'value']
        //     })
        //     .then(entity => {
        //         if (entity == null){
        //             next(new restifyErrors.BadRequestError('Mentioned material type is invalid'));
        //             return;
        //         }
        //         type = entity;
    
        //         return new Promise((resolve, reject) => {
        //             resolve();
        //         });
        //     })
        //     .then(() => {
        //         //check whether the file is of proper type

        //         console.log("req.files.materialFile.type = " + req.files.materialFile.type);
        //         console.log("type.value = " + type.value);

        //         const materialExt = req.files.materialFile.name.split('.').pop();

        //         if (type.value != req.files.materialFile.type ){
        //             next(new restifyErrors.BadRequestError('Invalid file type'));
        //             return;
        //         }
        //         else if (req.files.materialFile.type=='image/jpeg'){
        //             if (!(materialExt == 'jpg' || materialExt == 'jpeg')){
        //                 next(new restifyErrors.BadRequestError('Invalid file type'));
        //                 return;
        //             }
        //         } else if (req.files.materialFile.name.split('.').pop() != mime.extension(type.value)) {
        //             next(new restifyErrors.BadRequestError('Invalid file type'));
        //             return;
        //         }

        //         const materialPath = `/assets/material/${subjectId}/${generalUtil.toSafeFileSystemName(title)}.${mime.extension(type.value)}`;
        //         mv(req.files.materialFile.path, `${__dirname}/..${materialPath}`, err => {
        //             if (err){
        //                 next(new restifyErrors.InternalServerError(err));
        //                 return;
        //             }
        //             query.typeId = typeId;
        //             query.path = materialPath;
        //             save();
        //         });
        //     })
        //     .catch(err => {
        //         next(new restifyErrors.InternalServerError(err));
        //     });
        // } else {
        //     save();
        // }
    });

};