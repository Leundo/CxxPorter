class Node {
    /**
     * 
     * @param {Set<Stirng>} keySet 
     * @param {Boolean} isCircularlyDependent 
     */
    constructor(keySet, isCircularlyDependent) {
        this.keySet = keySet;
        this.isCircularlyDependent = isCircularlyDependent;
    }
}


module.exports = {
    Node,
}