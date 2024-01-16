const path = require('node:path');

/**
 * 
 * @param {String} text 
 * @returns {String|null}
 */
function extractQuotedText(text) {
	const matches = text.match(/"(.*?)"/);
	return matches ? matches[1] : null;
}

/**
 * 
 * @param {String} text 
 * @returns {String|null}
 */
function extractFramedText(text) {
	const matches = text.match(/<(.*?)>/);
	return matches ? matches[1] : null;
}


/**
 * 
 * @param {String} url 
 * @returns {String}
 */
function removeExtname(url) {
    return path.join(path.dirname(url), path.basename(url, path.extname(url)));
}


module.exports = {
    extractQuotedText,
    extractFramedText,
    removeExtname,
}