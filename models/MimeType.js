'use strict';

const db = require('./index');

module.exports = (sequelize, DataTypes) => {

    const MimeType = sequelize.define('MimeType', {

        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING
        },
        value: {
            type: DataTypes.STRING
        },
        details: {
            type: DataTypes.TEXT
        },
        logoPath: {
            type: DataTypes.STRING,
            field: 'logo_path'
        }

    }, {
        tableName: 'mime_types',
        underscored: true,
        timestamps: false
    });

    return MimeType;
};