'use strict';

const db = require('./index');
const User = db.User;

module.exports = function(sequelize, DataTypes){

    const Notice = sequelize.define('Notice', {

        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING
        },
        details: {
            type: DataTypes.TEXT
        },
        postedByUserId: {
            type: DataTypes.INTEGER,
            field: 'posted_by',
            references:{
                module: User,
                key: 'id'
            }
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active'
        }
    }, {
        tableName: 'notices',
        underscored: true
    });

    Notice.associate = (models) => {

        Notice.belongsTo(
            models.User,
            {
                foreignKey: {
                    fieldName: 'posted_by'
                },
                as: 'postedBy'
            }
        );
    };

    return Notice;
};