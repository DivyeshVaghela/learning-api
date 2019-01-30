'use strict';

const User = require('./index').User;
const Role = require('./index').Role;

module.exports = (sequelize, DataTypes) => {

    const UserRole = sequelize.define('UserRole', {

        userId: {
            type: DataTypes.INTEGER,
            field: 'user_id',
            references: {
                model: User,
                key: 'id'
            }
        },
        roleId:{
            type: DataTypes.INTEGER,
            field: 'role_id',
            references: {
                model: Role,
                key: 'id'
            }
        }
    }, {
        tableName: 'users_roles',
        underscored: true,
        timestamps: false
    });
    return UserRole;
};