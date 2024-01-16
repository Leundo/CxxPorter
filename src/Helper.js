const path = require('node:path');

/**
 * 
 * @param  {...Set<Any>} sets 
 * @returns {Set<Any>}
 */
function union(...sets) {
    return new Set([].concat(...sets.map(set => [...set])));
}

/**
 * 
 * @param {Set<Any>} a 
 * @param {Set<Any>} b 
 * @returns {Set<Any>}
 */
function diff(a, b) {
    return new Set([...a].filter(x => !b.has(x)));
}


/**
 * 
 * @param {Array<Any>} a 
 * @param {Array<Any>} b 
 * @returns {Bool}
 */
function compareArray(a, b) {
    return a.length === b.length && a.every((element, index) => element === b[index]);
}


/**
 * 
 * @param {Any[]} a 
 * @returns {Any[]}
 */
function unique(a) {
    return [...(new Set(a))];
}


module.exports = {
    union,
    diff,
    compareArray,
    unique,
};