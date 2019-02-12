'use strict';

// const Sequelize = require('sequelize');
// const db = require('./index');

module.exports = function(sequelize, DataTypes) {

    const User = sequelize.define('User', {

        id:{
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        email:{
            type: DataTypes.STRING
        },
        username:{
            type: DataTypes.STRING
        },
        password:{
            type: DataTypes.STRING
        },
        mobileNo:{
            field: 'mobile_no',
            type: DataTypes.STRING
        },
        emailVerified:{
            field: 'email_verified',
            type: DataTypes.BOOLEAN
        },
        mobileNoVerified:{
            field: 'mobile_no_verified',
            type: DataTypes.BOOLEAN
        },
        verificationCode: {
            field: 'verification_code',
            type: DataTypes.STRING
        }
    },{
        tableName: 'users',
        underscored: true
    });

    User.associate = (models) => {
        User.belongsToMany(
            models.Role,
            {
                through: models.UserRole
            }
        );
    };

    return User;
};