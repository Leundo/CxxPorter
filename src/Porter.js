const path = require('node:path');
const fs = require('node:fs');

const { Dependence } = require('./Dependence.js');
const { FileGuide } = require('./FileManager.js');
const { CxxDescriptor } = require('./CxxDescriptor.js');
const { Node } = require('./Node.js');


const textMaster = require('./TextMaster.js');
const fileManager = require('./FileManager.js');
const helper = require('./Helper.js');


/**
 * 
 * @param {CxxDescriptor[]} descriptors 
 * @param {Boolean} shouldIgnoreExtname 
 * @param {Boolean} shouldIncludeSameNameCpp 
 * @returns {Map<String, Set<String>>}
 */
function buildDependenceGraph(descriptors, shouldIgnoreExtname = true, shouldIncludeSameNameCpp = true) {
    let graph = new Map();
    for (let descriptor of descriptors) {
        let dependences = descriptor.dependences.filter((item) => {
            return item.isQuoted;
        });
        let requiredIds = descriptors.filter((checkedDescriptor) => {
            if (shouldIncludeSameNameCpp) {
                if (checkedDescriptor.guide.extname !== descriptor.guide.extname && helper.compareArray(checkedDescriptor.getPathItems(), descriptor.getPathItems())) {
                    return true;
                }
            }

            return dependences.find((dependence) => {
                if (shouldIgnoreExtname) {
                    return helper.compareArray([...checkedDescriptor.getPathItems()], dependence.pathItems);
                } else {
                    return helper.compareArray([...checkedDescriptor.getPathItems()], dependence.pathItems) && checkedDescriptor.guide.extname === dependence.extname;
                }
            }) !== undefined;
        }).map((descriptor) => {
            return descriptor.getId();
        }).filter((id) => {
            // Remove self-dependence
            return descriptor.getId() !== id;
        });

        graph.set(descriptor.getId(), new Set(requiredIds));
    }
    return graph;
}


/**
 * 
 * @param {CxxDescriptor[]} descriptors 
 * @param {Map<String, Set<String>>} graph 
 * @returns {Node}
 */
function findMinimalDependencyGraph(descriptors, urls, graph) {
    let subKeys = new Set(descriptors.filter((descriptor) => {
        for (const url of urls) {
            const parsed = path.parse(url);
            if (descriptor.guide.dirItems.join('/') === parsed.dir && descriptor.guide.filename === parsed.name) {
                return true;
            }
        }
        return false;
    }).map((descriptor) => {
        return descriptor.getId();
    }));
    
    let subKeyCount = subKeys.size;
    do {
        subKeyCount = subKeys.size;
        subKeys = ([...graph.entries()]).reduce((accumulator, [currentKey, currentValue]) => {
            if (subKeys.has(currentKey)) {
                return helper.union(helper.union(accumulator, currentValue), new Set([currentKey]));
            }
            return accumulator;
        }, subKeys);
    } while (subKeys.size !== subKeyCount)
    
    console.log(`Node's key count: ${subKeyCount}`);
    return new Node(subKeys, false);
}


/**
 * 
 * @param {String} basePath 
 * @param {String} packageName 
 * @param {String} prefix 
 * @param {CxxDescriptor[]} descriptors 
 * @param {Node} nodes 
 */
function generatorNodeFile(basePath, packageName, prefix, descriptors, node) {
    const folderPath = path.resolve(basePath, 'Build');
    fs.mkdirSync(folderPath, { recursive: true }, (error) => {
        if (error) throw error;
    });
    const targetDescriptors = descriptors.filter((descriptor) => {
        return node.keySet.has(descriptor.getId());
    });
    let note = `isCircularlyDependent: ${node.isCircularlyDependent}\n\n\n`;
        
    note += '# Import\n\n```swift\n';
    for (const descriptor of targetDescriptors) {
        if (['.h', '.hpp'].includes(descriptor.guide.extname)) {
            note += `#import <${packageName}/${prefix}${descriptor.getPathItems().join('_')}.hpp>\n`;
        }
    }
    note += '```\n';

    note += '\n\n\n# File List\n\n'
    for (const descriptor of targetDescriptors) {
        note += `${descriptor.guide.dirItems.join('/')}/${descriptor.guide.filename}${descriptor.guide.extname}\n`;
    }

    fs.writeFileSync(path.resolve(basePath, `Node.txt`), note, {encoder: 'utf8'});

    for (const descriptor of targetDescriptors) {
        let filename = `${prefix}${descriptor.getPathItems().join('_')}`;
        if (['.h', '.hpp'].includes(descriptor.guide.extname)) {
            filename += '.hpp';
        } else if (['.c', '.cxx', '.cpp', '.cc'].includes(descriptor.guide.extname)) {
            filename += '.cpp';
        } else {
            filename += descriptor.guide.extname;
        }
        fs.writeFileSync(path.resolve(folderPath, filename), descriptor.code, {encoder: 'utf8'});
    }
}


module.exports = {
    buildDependenceGraph,
    findMinimalDependencyGraph,
    generatorNodeFile,
}