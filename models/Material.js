'use strict';

const db = require('./index');
const User = db.User;
const Subject = db.Subject;
const MimeType = db.MimeType;

module.exports = (sequelize, DataTypes) => {

    const Material = sequelize.define('Material', {

        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        subjectId: {
            type: DataTypes.INTEGER,
            field: 'subject_id',
            references: {
                module: Subject,
                key: 'id'
            }
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
        typeId: {
            type: DataTypes.INTEGER,
            field: 'type_id',
            references: {
                module: MimeType,
                key: 'id'
            }
        },
        path: {
            type: DataTypes.STRING
        },
        isPremium: {
            type: DataTypes.BOOLEAN,
            field: 'is_premium'
        },
        createdByUserId: {
            type: DataTypes.INTEGER,
            field: 'created_by',
            references: {
                module: User,
                key: 'id'
            }
        }
    }, {
        tableName: 'materials',
        underscored: true,
    });

    Material.associate = (models) => {

        Material.belongsTo(
            models.Subject,
            {
                foreignKey: {
                    fieldName: 'subject_id'
                },
                as: 'subject'
            }
        );

        Material.belongsTo(
            models.MimeType,
            {
                foreignKey: {
                    fieldName: 'type_id'
                },
                as: 'type'
            }
        );

        Material.belongsTo(
            models.User,
            {
                foreignKey: {
                    fieldName: 'created_by'
                },
                as: 'createdBy'
            }
        );
    };

    return Material;
};