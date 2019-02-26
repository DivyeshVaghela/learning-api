'use strict';

const db = require('./index');
const User = db.User;

module.exports = (sequelize, DataTypes) => {

    const Package = sequelize.define('Package', {
        
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
        duration: {
            type: DataTypes.INTEGER
        },
        durationScale: {
            type: DataTypes.STRING,
            field: 'duration_scale'
        },
        rate: {
            type: DataTypes.FLOAT
        },
        creatorUserId: {
            type: DataTypes.INTEGER,
            field: 'created_by',
            references:{
                module: User,
                key: 'id'
            }
        },
        modifierUserId: {
            type: DataTypes.INTEGER,
            field: 'modified_by',
            references:{
                module: User,
                key: 'id'
            }
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active'
        }
    },{
        tableName: 'packages',
        underscored: true
    });

    Package.associate = (models) => {

        Package.belongsTo(
            models.User,
            {
                foreignKey: {
                    fieldName: 'created_by'
                },
                as: 'createdBy'
            }
        );
        Package.belongsTo(
            models.User,
            {
                foreignKey: {
                    fieldName: 'modified_by'
                },
                as: 'modifiedBy'
            }
        );
        Package.belongsToMany(
            models.User,
            {
                through: models.UserPackage
            }
        );
    };

    return Package;
};