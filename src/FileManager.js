const path = require('node:path');
const fs = require('node:fs');


class FileGuide {
    /**
     * 
     * @param {String} filePath 
     * @param {String} filename 
     * @param {String} extname 
     * @param {String[]} dirItems 
     */
    constructor(filePath, filename, extname, dirItems) {
        this.filePath = filePath;
        this.filename = filename;
        this.extname = extname;
        this.dirItems = dirItems;
    }
}


/**
 * 
 * @param {String} basePath 
 * @returns {Array<FileGuide>}
 */
function dive(basePath) {
    return internalDive(basePath, []);
}


/**
 * 
 * @param {String[]} basePath 
 * @param {String} dirItems 
 * @returns {Array<FileGuide>}
 */
function internalDive(basePath, dirItems) {
    const filenames = fs.readdirSync(path.resolve(basePath, ...dirItems));

    return filenames.reduce(
        (accumulator, currentValue) => {
            let filePath = path.resolve(basePath, ...dirItems, currentValue);

            if (fs.statSync(filePath).isDirectory()) {
                return accumulator.concat(internalDive(basePath, [...dirItems, currentValue]));
            } else {
                let parsedResult = path.parse(filePath);
                return accumulator.concat([new FileGuide(filePath, parsedResult.name, parsedResult.ext, dirItems)]);
            }
        },
        [],
    );
}



module.exports = {
    FileGuide,
    dive,
}