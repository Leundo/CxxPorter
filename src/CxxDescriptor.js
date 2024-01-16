const path = require('node:path');

const { FileGuide } = require('./FileManager.js');
const { Dependence } = require('./Dependence.js');

const helper = require('./Helper.js');


class CxxDescriptor {
    /**
     * 
     * @param {FileGuide} guide
     * @param {Dependence[]} dependences 
     * @param {String} code 
     */
    constructor(guide, dependences, code) {
        this.guide = guide;
        this.dependences = dependences;
        this.code = code;
    }

    /**
     * 
     * @param {function(Dependence): Bool} filter 
     */
    filterDependences(filter) {
        this.dependences = this.dependences.filter(filter);
    }

    /**
     * 
     * @returns {String}
     */
    getId() {
        return this.guide.filePath;
    }

    /**
     * 
     * @returns {String[]}
     */
    getPathItems() {
        return [...this.guide.dirItems, this.guide.filename];
    }

    /**
     * 
     * @param {String[]} paths 
     * @returns {Boolean}
     */
    isRelative(paths) {
        for (const item of paths) {
            const parsed = path.parse(item);
            if (this.guide.dirItems.join('/') === parsed.dir && this.guide.filename === parsed.name) {
                return true;
            }
        }
        return false;
    }
}


module.exports = {
    CxxDescriptor,
}