const bcrypt = require('bcryptjs');
const restifyErrors = require('restify-errors');

const db = require('./models');
const User = db.User;
const Role = db.Role;
const UserPackge = db.UserPackge;
const Package = db.Package;
const Op = db.sequelize.Op;

module.exports.authFailedMessage = authFailedMessage  = 'Authentication Failed';
module.exports.forbiddenMessage = forbiddenMessage = 'You don\'t have enough priviledges'; //Not authorized for a role

// exports.authenticate = (email, password) => {

//     return new Promise((resolve, reject) => {

//         User.findOne({
//             where: {email},
//             attributes: [
//                 'email', 'username', 'mobileNo', 'password'
//             ]
//         }).then(user => {

//                 bcrypt.compare(password, user.password)
//                     .then(isMatch => {

//                         if (isMatch){
//                             resolve(user);
//                         } else {
//                             reject(authFailedMessage);
//                         }
//                     })
//                     .catch(err => {
//                         reject(authFailedMessage)
//                     });
//             })
//             .catch(err => {
//                 reject(authFailedMessage)
//             });
//     });

// };

module.exports.allowedRolesAdmin = allowedRolesAdmin = ['Admin'];
module.exports.allowedRolesAll = allowedRolesAll = ['Admin','Learner'];

module.exports.authorize = (req, roles) => {

    var isAuthorized = false;

    req.user.Roles.every(element => {
        
        if (roles.indexOf(element.name) != -1){
            isAuthorized = true;
            return false;
        }
        return true;
    });

    return isAuthorized;
};

module.exports.authenticate = (email, password, roles, withinApp) => {

    return new Promise((resolve, reject) => {

        User.findOne({
            attributes: [
                'id', 'email', 'username', 'mobileNo', 'password', 'emailVerified', 'mobileNoVerified', 'created_at', 'updated_at'
            ],
            where: {email},
            include: [{
                model: Role,
                require: true,
                attributes: ['name'],
                through: {
                    attributes: []
                }
            }, {
                model: Package,
                rquired: false,
                attributes: ['id', 'title', 'subtitle', 'details', 'duration', 'durationScale', 'rate', 'isActive', 'created_at', 'updated_at'],

                through: {
                    attributes: ['id','validityStart','validityEnd','isActive'],
                    where: {
                        isActive: true,
                        validityStart:{
                            [Op.lt]: db.Sequelize.fn('current_timestamp')
                        },
                        validityEnd:{
                            [Op.gt]: db.Sequelize.fn('current_timestamp')
                        }
                    }
                }
            }]
        }).then(user => {

            if (user === null){
                reject(authFailedMessage);
            } else {

                const proceed = (isMatched) => {

                    if (isMatched === true){
                        var authorized = false;
                        user.Roles.every(element => {
                            if (roles.indexOf(element.name) != -1){
                                authorized = true;
                                return false;
                            }
                            return true;
                        });

                        if(authorized){
                            console.log(`authorized`);
                            // UserPackage.findOne({
                            //     attributes: ['id','validityStart','validityEnd','isActive'],
                            //     include: [
                            //         {
                            //             model: Package,
                            //             require: true,
                            //             attributes: ['id', 'title', 'subtitle', 'details', 'duration', 'durationScale', 'rate', 'isActive', 'created_at', 'updated_at'],
                            //             as: 'package'
                            //         }
                            //     ],
                            //     where: {
                            //         userId: user.id,
                            //         isActive: true,
                            //         validityStart:{
                            //             [Op.lt]: db.Sequelize.fn('current_timestamp')
                            //         },
                            //         validityEnd:{
                            //             [Op.gt]: db.Sequelize.fn('current_timestamp')
                            //         }
                            //     }
                            // }).then(userPackage => {
                            //     console.log(userPackage);
                            //     user.package = userPackage;
                            //     resolve(user);
                            // }).catch(err => {
                            //     console.log(err);
                            //     reject(err);
                            // });
                            resolve(user);
                        }
                        else
                            reject(forbiddenMessage);
                    } else {
                        reject(authFailedMessage);
                    }
                };

                if (withinApp === true){
                    proceed(true);
                } else {
                    bcrypt.compare(password, user.password)
                        .then(isMatch => {
                            proceed(isMatch);
                        })
                        .catch(err => {
                            reject(authFailedMessage)
                        });
                }
            }
        })
        .catch(err => {
            console.log(err);
            reject(authFailedMessage)
        });
    });

};