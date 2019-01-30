'use strict';

module.exports = function(sequelize, DataTypes) {

    const Role = sequelize.define('Role', {

        id:{
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING
        },
        details: {
            type: DataTypes.TEXT
        }
    },{
        tableName: 'roles',
        underscored: true,
        timestamps: false
    });

    Role.associate = (models) => {
        Role.belongsToMany(
            models.User,
            {
                through: models.UserRole
            }
        );
    };

    return Role;
};

// var Role = db.sequelize.define('roles', {

//     id:{
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         primaryKey: true
//     },
//     name: {
//         type: Sequelize.STRING
//     },
//     details: {
//         type: Sequelize.TEXT
//     }
// },{
//     underscored: true,
//     classMethods: {
//         associate: function(models){
//             Role.belongsToMany(
//                 models.User,
//                 {
//                     through: 'users_roles',
//                     foreignKey: 'FK_userrole_role'
//                 }
//             );
//         }
//     }
// });

// module.exports = Role;