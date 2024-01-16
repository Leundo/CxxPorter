const { FileGuide } = require('./FileManager.js');


class IncRecord {
    /**
     * 
     * @param {FileGuide} guide
     * @param {String} content 
     */
    constructor(guide, content) {
        this.guide = guide;
        this.content = content;
    }

    getExpandsion() {
        return `\n// MARK: - BEGIN ${this.guide.dirItems.join('_')}_${this.guide.filename}${this.guide.extname}\n` +
        this.content + '\n' +
        `// MARK: - END ${this.guide.dirItems.join('_')}_${this.guide.filename}${this.guide.extname}\n`;
    }
}


module.exports = {
    IncRecord,
}