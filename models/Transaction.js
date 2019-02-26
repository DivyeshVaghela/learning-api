'use strict';

const db = require('./index');
const User = db.User;
const Package = db.Package;

module.exports = (sequelize, DataTypes) => {

    const Transaction = sequelize.define('Transaction', {

        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        userId: {
            type: DataTypes.INTEGER,
            field: 'user_id',
            references:{
                module: User,
                key: 'id'
            }
        },
        txnId: {
            type: DataTypes.STRING,
            field: 'txn_id'
        },
        title: {
            type: DataTypes.STRING
        },
        details: {
            type: DataTypes.TEXT
        },
        amount: {
            type: DataTypes.FLOAT
        },
        packageId: {
            type: DataTypes.INTEGER,
            field: 'package_id',
            references:{
                module: Package,
                key: 'id'
            }
        },
        status: {
            type: DataTypes.STRING
        },
        requestHash: {
            type: DataTypes.STRING,
            field: 'request_hash'
        },
        responseHash: {
            type: DataTypes.STRING,
            field: 'response_hash'
        },
        response: {
            type: DataTypes.TEXT
        },
        completionTime: {
            type: DataTypes.DATE,
            field: 'completion_time'
        }
    }, {
        tableName: 'transactions',
        underscored: true
    });

    Transaction.associate = (models) => {

        Transaction.belongsTo(
            models.User,
            {
                foreignKey: {
                    fieldName: 'user_id'
                },
                as: 'user'
            }
        );
        Transaction.belongsTo(
            models.Package,
            {
                foreignKey: {
                    fieldName: 'package_id'
                },
                as: 'package'
            }
        );

    };

    return Transaction;

};