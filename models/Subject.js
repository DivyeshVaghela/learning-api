'use strict';

const db = require('./index');
const User = db.User;

module.exports = (sequelize, DataTypes) => {

    const Subject = sequelize.define('Subject', {

        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING
        },
        subtitle: {
            type: DataTypes.STRING
        },
        details: {
            type: DataTypes.TEXT
        },
        logoPath: {
            type: DataTypes.STRING,
            field: 'logo_path'
        },
        createdByUserId: {
            type: DataTypes.INTEGER,
            field: 'created_by',
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
        tableName: 'subjects',
        underscored: true
    });

    Subject.associate = (models) => {

        Subject.belongsTo(
            models.User,
            {
                foreignKey: {
                    fieldName: 'created_by'
                },
                as: 'createdBy'
            }
        );
    };

    return Subject;
};