const path = require('node:path');

const textMaster = require('./TextMaster');


class Dependence {
    /**
     * 
     * @param {String[]} pathItems 
     * @param {String} extname 
     * @param {Bool} isQuoted 
     */
    constructor(pathItems, extname, isQuoted) {
        this.pathItems = pathItems;
        this.extname = extname;
        this.isQuoted = isQuoted;
    }
    
    /**
     * 
     * @param {String} includeText 
     * @param {function(String): String|null} contentModifier 
     * @returns {Dependence|null}
     */
    static init(includeText, contentModifier = null) {
        let isQuoted = true;
        let trimedText = includeText.trim();
        if (!trimedText.startsWith('#include')) {
            return null;
        }
        let content = textMaster.extractQuotedText(trimedText);
        if (content === null) {
            isQuoted = false;
            content = textMaster.extractFramedText(trimedText);
            if (content === null) {
                return null;
            }
        }
        if (contentModifier === null) {
            return new Dependence(textMaster.removeExtname(content).split('/'), path.extname(content), isQuoted);
        } else {
            return new Dependence(textMaster.removeExtname(contentModifier(content)).split('/'), path.extname(content), isQuoted);
        }
    }
}


module.exports = {
    Dependence,
}