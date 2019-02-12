module.exports.toSafeFileSystemName = toSafeFileSystemName = (name) => {

    return name.replace(/[\/\\:\|\*\?\,\<\>\"\'\[\]]/g, '_');
};

module.exports.isStringNull = isStringNull = (str) => {
    return str == null || str === '' || str === 'null';
};

module.exports.stringToNullIfNull = stringToNullIfNull = (str) => {
    if (isStringNull(str))
        str = null;
}