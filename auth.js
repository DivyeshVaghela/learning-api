const bcrypt = require('bcryptjs');
const restifyErrors = require('restify-errors');

const db = require('./models');
const User = db.User;
const Role = db.Role;

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

module.exports.authenticate = (email, password, role) => {

    return new Promise((resolve, reject) => {

        User.findOne({
            attributes: [
                'id', 'email', 'username', 'mobileNo', 'password'
            ],
            where: {email},
            include: [{
                model: Role,
                require: true,
                attributes: ['name'],
                through: {
                    attributes: []
                }
            }]
        }).then(user => {

            if (user === null){
                reject(authFailedMessage);
            } else {

                bcrypt.compare(password, user.password)
                    .then(isMatch => {

                        if (isMatch){
                            var authorized = false;
                            user.Roles.every(element => {
                                if (element.name === role){
                                    authorized = true;
                                    return false;
                                }
                                return true;
                            });

                            if(authorized)
                                resolve(user);
                            else
                                reject(forbiddenMessage);
                        } else {
                            reject(authFailedMessage);
                        }
                    })
                    .catch(err => {
                        reject(authFailedMessage)
                    });
                }
            })
            .catch(err => {
                reject(authFailedMessage)
            });
    });

};