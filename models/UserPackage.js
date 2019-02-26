'use strict';

const User = require('./index').User;
const Package = require('./index').Package;
const Transaction = require('./index').Transaction;

module.exports = (sequelize, DataTypes) => {

    const UserPackage = sequelize.define('UserPackage', {

        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        userId: {
            type: DataTypes.INTEGER,
            field: 'user_id',
            references: {
                model: User,
                key: 'id'
            }
        },
        packageId: {
            type: DataTypes.INTEGER,
            field: 'package_id',
            references: {
                model: Package,
                key: 'id'
            }
        },
        transactionId: {
            type: DataTypes.INTEGER,
            field: 'transaction_id',
            references: {
                model: Transaction,
                key: 'id'
            }
        },
        validityStart: {
            type: DataTypes.DATE,
            field: 'validity_start'
        },
        validityEnd: {
            type: DataTypes.DATE,
            field: 'validity_end'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active'
        }

    }, {
        tableName: 'users_packages',
        underscored: true,
        timestamps: false
    });

    UserPackage.associate = (models) => {

        UserPackage.belongsTo(
            models.User,
            {
                foreignKey: {
                    fieldName: 'user_id'
                },
                as: 'user'
            }
        );
        UserPackage.belongsTo(
            models.Package,
            {
                foreignKey: {
                    fieldName: 'package_id'
                },
                as: 'package'
            }
        );
        UserPackage.belongsTo(
            models.Transaction,
            {
                foreignKey: {
                    fieldName: 'transaction_id'
                },
                as: 'transaction'
            }
        );

    };

    return UserPackage;

};