const path = require('node:path');
const fs = require('node:fs');

const { Dependence } = require('./Dependence.js');
const { FileGuide } = require('./FileManager.js');
const { CxxDescriptor } = require('./CxxDescriptor.js');
const { IncRecord } = require('./IncRecord.js');

const textMaster = require('./TextMaster.js');
const fileManager = require('./FileManager.js');
const helper = require('./Helper.js');


/**
 * 
 * @param {FileGuide[]} guides 
 * @returns {IncRecord[]}
 */

function gatherIncRecords(guides) {
    return guides.map((guide) => {
        if (!['.inc', 'inl'].includes(guide.extname)) {
            return null;
        }
        let content = fs.readFileSync(guide.filePath, 'utf8');
        return new IncRecord(guide, content);
    }).filter((item) => {
        return item !== null;
    });
}


/**
 * 
 * @param {String} text 
 * @param {function(Dependence, String): String} lineConverter 
 * @param {function(String): String|null} contentModifier 
 * @returns {{code: String, dependences: Dependence[]}}
 */
function preprocessSourceCode(text, lineConverter, contentModifier) {
    let dependences = [];
    let code = text.split('\n').reduce(
        (accumulator, currentValue) => {
            let dependence = Dependence.init(currentValue, contentModifier);
            if (dependence !== null) {
                dependences.push(dependence);
            }
            return accumulator + lineConverter(dependence, currentValue) + '\n';
		},
		'',
    );
    return {
        code: code,
        dependences: dependences,
    };
}


/**
 * 
 * @param {FileGuide} guide 
 * @param {IncRecord[]} incRecords 
 * @param {function(FileGuide, Dependence, IncRecord[], String): String} lineConverter 
 * @param {function(String): String|null} contentModifier 
 * @returns {CxxDescriptor}
 */
function preprocess(guide, incRecords, lineConverter, contentModifier) {
    let text = fs.readFileSync(guide.filePath, 'utf8');
    let result = preprocessSourceCode(text, (dependence, originalText) => {
        return lineConverter(guide, dependence, incRecords, originalText);
    }, contentModifier);
    return new CxxDescriptor(guide, result.dependences, result.code);
}


/**
 * 
 * @param {String} rootPath 
 * @param {String} packageName 
 * @param {function(FileGuide): Bool} filter 
 * @param {function(String, FileGuide, Dependence, String): String} lineConverter 
 * @param {function(String): String|null} contentModifier 
 * @returns {CxxDescriptor[]}
 */
function diveToProprocess(rootPath, packageName, filter, lineConverter, contentModifier) {
    let guides = fileManager.dive(rootPath);
    let records = gatherIncRecords(guides);
    return guides.filter(filter).map((guide) => {
        return preprocess(guide, records, (guide, dependence, incRecords, originalText) => {
            return lineConverter(packageName, guide, dependence, incRecords, originalText);
        }, contentModifier);
    });
}


/**
 * 
 * @param {FileGuide} guide 
 * @returns {Bool}
 */
function abseilGuideFilter(guide) {
    if (!['.c', '.cxx', '.cpp', '.cc', '.h', '.hpp', '.inl', '.inc'].includes(guide.extname)) {
        return false;
    }
    if (guide.filename.endsWith('_test') || guide.filename.endsWith('_benchmark')) {
        return false;
    }
    return true;
}

/**
 * 
 * @param {FileGuide} guide 
 * @returns {Bool}
 */
function protobufGuideFilter(guide) {
    if (!['.c', '.cxx', '.cpp', '.cc', '.h', '.hpp', '.inl', '.inc'].includes(guide.extname)) {
        return false;
    }
    if (guide.filename.endsWith('_test') || guide.filename.endsWith('_unittest') || guide.filename.startsWith('test') || guide.filename.startsWith('mock_')) {
        return false;
    }
    if (helper.compareArray(guide.dirItems, ['google', 'protobuf', 'testing'])) {
        return false;
    }
    if (helper.compareArray(guide.dirItems, ['google', 'protobuf'])) {
        if (guide.filename === 'map_lite_test_util' || guide.filename === 'reflection_tester' || guide.filename.startsWith('map_test_util')) {
            return false;
        }
    }
    return true;
}

/**
 * 
 * @param {FileGuide} guide 
 * @returns {Bool}
 */
function flatbuffersGuideFilter(guide) {
    if (!['.c', '.cxx', '.cpp', '.cc', '.h', '.hpp', '.inl', '.inc'].includes(guide.extname)) {
        return false;
    }
    if (guide.filename.endsWith('_test') || guide.filename.endsWith('_benchmark')) {
        return false;
    }
    return true;
}


/**
 * 
 * @param {String} content 
 * @returns {String}
 */
function abseilContentModifier(content) {
    if (content.startsWith('time_') || content.startsWith('tzfile')) {
        return `absl/time/internal/cctz/src/${content}`;
    }
    return content;
}


/**
 * 
 * @param {String} content 
 * @returns {String}
 */
function protobufContentModifier(content) {
    return content;
}


/**
 * 
 * @param {String} content 
 * @returns {String}
 */
function flatbuffersContentModifier(content) {
    return content;
}


/**
 * 
 * @param {String} packageName 
 * @param {FileGuide} guide 
 * @param {Dependence|null} dependence
 * @param {IncRecord[]} incRecords 
 * @param {String} originalText 
 * @returns {String}
 */
function abseilLineConverter(packageName, guide, dependence, incRecords, originalText) {
    if (dependence === null) {
        return originalText.replace(/absl::optional/g, 'std::optional');
    }
    const thisFunction = abseilLineConverter;
    if (!dependence.isQuoted) {
        return originalText;
    }

    if (['.h', '.hpp'].includes(dependence.extname)) {
        if (['.h', '.hpp', '.inc', 'inl'].includes(guide.extname)) {
            return `#include <${packageName}/${dependence.pathItems.join('_')}.hpp>`;
        } else if (['.c', '.cxx', '.cpp', '.cc'].includes(guide.extname)) {
            return `#include "${dependence.pathItems.join('_')}.hpp"`;
        } else {
            throw new Error(`Extname ${guide.extname} is invaild.`);
        }
    } else if (['.inc', '.inl'].includes(dependence.extname)) {
        if (['.c', '.cxx', '.cpp', '.cc', '.h', '.hpp', '.inc', 'inl'].includes(guide.extname)) {
            const record = incRecords.find((record) => {
                return dependence.extname === record.guide.extname && helper.compareArray(dependence.pathItems, [...record.guide.dirItems, record.guide.filename]);
            });
            if (record === undefined) {
                throw new Error(`IncRcord ${dependence.pathItems.join('/')}${dependence.extname} is not found.`);
            }
            record.content = preprocess(record.guide, incRecords, (guide, dependence, incRecords, originalText) => {
                return thisFunction(packageName, guide, dependence, incRecords, originalText);
            }).code;
            return record.getExpandsion();
        } else {
            throw new Error(`Extname ${guide.extname} is invaild.`);
        }
    } else {
        return originalText;
    }
}


/**
 * 
 * @param {String} packageName 
 * @param {FileGuide} guide 
 * @param {Dependence|null} dependence
 * @param {IncRecord[]} incRecords 
 * @param {String} originalText 
 * @returns {String}
 */
function protobufLineConverter(packageName, guide, dependence, incRecords, originalText) {
    if (dependence === null) {
        return originalText.replace(/absl::optional/g, 'std::optional');
    }
    const thisFunction = protobufLineConverter;
    if (!dependence.isQuoted) {
        return originalText;
    }

    if (['.h', '.hpp'].includes(dependence.extname)) {
        if (['.h', '.hpp', '.inc', 'inl'].includes(guide.extname)) {
            if (dependence.pathItems[0] === 'absl') {
                return `#include <CppAbseil/${dependence.pathItems.join('_')}.hpp>`;
            } else {
                return `#include <${packageName}/${dependence.pathItems.join('_')}.hpp>`;
            }
        } else if (['.c', '.cxx', '.cpp', '.cc'].includes(guide.extname)) {
            if (dependence.pathItems[0].startsWith('utf8')) {
                return `#include "utf8range_${dependence.pathItems.join('_')}.hpp"`;
            } else {
                return `#include "${dependence.pathItems.join('_')}.hpp"`;
            }
        } else {
            throw new Error(`Extname ${guide.extname} is invaild.`);
        }
    } else if (['.inc', '.inl'].includes(dependence.extname)) {
        if (['.c', '.cxx', '.cpp', '.cc', '.h', '.hpp', '.inc', 'inl'].includes(guide.extname)) {
            const record = incRecords.find((record) => {
                return dependence.extname === record.guide.extname && helper.compareArray(dependence.pathItems, [...record.guide.dirItems, record.guide.filename]);
            });
            if (record === undefined) {
                throw new Error(`IncRcord ${dependence.pathItems.join('/')}${dependence.extname} is not found.`);
            }
            record.content = preprocess(record.guide, incRecords, (guide, dependence, incRecords, originalText) => {
                return thisFunction(packageName, guide, dependence, incRecords, originalText);
            }).code;
            return record.getExpandsion();
        } else {
            throw new Error(`Extname ${guide.extname} is invaild.`);
        }
    } else {
        return originalText;
    }
}


/**
 * 
 * @param {String} packageName 
 * @param {FileGuide} guide 
 * @param {Dependence|null} dependence
 * @param {IncRecord[]} incRecords 
 * @param {String} originalText 
 * @returns {String}
 */
function flatbuffersLineConverter(packageName, guide, dependence, incRecords, originalText) {
    if (dependence === null) {
        return originalText;
    }
    const thisFunction = flatbuffersLineConverter;
    if (!dependence.isQuoted) {
        return originalText;
    }

    if (['.h', '.hpp'].includes(dependence.extname)) {
        if (['.h', '.hpp', '.inc', 'inl'].includes(guide.extname)) {
            return `#include <${packageName}/${dependence.pathItems.join('_')}.hpp>`;
        } else if (['.c', '.cxx', '.cpp', '.cc'].includes(guide.extname)) {
            return `#include "${dependence.pathItems.join('_')}.hpp"`;
        } else {
            throw new Error(`Extname ${guide.extname} is invaild.`);
        }
    } else if (['.inc', '.inl'].includes(dependence.extname)) {
        if (['.c', '.cxx', '.cpp', '.cc', '.h', '.hpp', '.inc', 'inl'].includes(guide.extname)) {
            const record = incRecords.find((record) => {
                return dependence.extname === record.guide.extname && helper.compareArray(dependence.pathItems, [...record.guide.dirItems, record.guide.filename]);
            });
            if (record === undefined) {
                throw new Error(`IncRcord ${dependence.pathItems.join('/')}${dependence.extname} is not found.`);
            }
            record.content = preprocess(record.guide, incRecords, (guide, dependence, incRecords, originalText) => {
                return thisFunction(packageName, guide, dependence, incRecords, originalText);
            }).code;
            return record.getExpandsion();
        } else {
            throw new Error(`Extname ${guide.extname} is invaild.`);
        }
    } else {
        return originalText;
    }
}


/**
 * 
 * @param {String} packageName 
 * @param {FileGuide} guide 
 * @param {Dependence|null} dependence
 * @param {IncRecord[]} incRecords 
 * @param {String} originalText 
 * @returns {String}
 */
function simdeLineConverter(packageName, guide, dependence, incRecords, originalText) {
    if (dependence === null) {
        return originalText;
    }
    const thisFunction = simdeLineConverter;
    if (!dependence.isQuoted) {
        return originalText;
    }

    if (['.h', '.hpp'].includes(dependence.extname)) {
        if (['.h', '.hpp', '.inc', 'inl'].includes(guide.extname)) {
            pathItems = [...guide.dirItems];
            if (dependence.pathItems.length == 0) {
                pathItems = [];
            } else if (dependence.pathItems[0] == '..') {
                for (index = 0; index < dependence.pathItems.length; index++) {
                    if (dependence.pathItems[index] == '..') {
                        pathItems.pop();
                    } else {
                        pathItems = pathItems.concat([...dependence.pathItems.slice(index, dependence.pathItems.length)]);
                        break;
                    }
                }
            } else {
                pathItems = [...dependence.pathItems];
            }
            
            if (JSON.stringify(guide.dirItems) == JSON.stringify([ 'simde', 'arm', 'neon' ])) {
                if (pathItems.length == 1) {
                    pathItems = [ 'simde', 'arm', 'neon' ].concat(pathItems);
                }
            } else if (JSON.stringify(guide.dirItems) == JSON.stringify([ 'simde', 'arm', 'sve' ])) {
                if (pathItems.length == 1) {
                    pathItems = [ 'simde', 'arm', 'sve' ].concat(pathItems);
                }
            } else if (JSON.stringify(guide.dirItems) == JSON.stringify([ 'simde', 'arm' ])) {
                pathItems = [ 'simde', 'arm' ].concat(pathItems);
            } else if (JSON.stringify(guide.dirItems) == JSON.stringify([ 'simde', 'x86', 'avx512' ])) {
                if (pathItems.length == 1) {
                    pathItems = [ 'simde', 'x86', 'avx512' ].concat(pathItems);
                }
            } else if (JSON.stringify(guide.dirItems) == JSON.stringify([ 'simde', 'x86', 'avx512' ])) {
                if (pathItems.length == 1) {
                    pathItems = [ 'simde', 'x86', 'avx512' ].concat(pathItems);
                }
            } else if (JSON.stringify(guide.dirItems) == JSON.stringify([ 'simde', 'x86' ])) {
                if (pathItems.length == 1) {
                    pathItems = [ 'simde', 'x86' ].concat(pathItems);
                }
            } else if (JSON.stringify(guide.dirItems) == JSON.stringify([ 'simde', 'mips', 'msa' ])) {
                if (pathItems.length == 1) {
                    pathItems = [ 'simde', 'mips', 'msa' ].concat(pathItems);
                }
            } else if (JSON.stringify(guide.dirItems) == JSON.stringify([ 'simde', 'mips' ])) {
                pathItems = [ 'simde', 'mips' ].concat(pathItems);
            } else if (JSON.stringify(guide.dirItems) == JSON.stringify([ 'simde', 'wasm' ])) {
                if (pathItems.length == 1) {
                    pathItems = [ 'simde', 'wasm' ].concat(pathItems);
                }
            } else if (JSON.stringify(guide.dirItems) == JSON.stringify([ 'simde'])) {
                if (pathItems.length == 1) {
                    pathItems = ['simde'].concat(pathItems);
                }
            } else {
                console.log(guide.dirItems, pathItems, dependence.pathItems);
            }

            // console.log(guide.dirItems, pathItems, dependence.pathItems);
            return `#include <${packageName}/${pathItems.join('_')}.hpp>`;
        } else if (['.c', '.cxx', '.cpp', '.cc'].includes(guide.extname)) {
            return `#include "${dependence.pathItems.join('_')}.hpp"`;
        } else {
            throw new Error(`Extname ${guide.extname} is invaild.`);
        }
    } else if (['.inc', '.inl'].includes(dependence.extname)) {
        if (['.c', '.cxx', '.cpp', '.cc', '.h', '.hpp', '.inc', 'inl'].includes(guide.extname)) {
            const record = incRecords.find((record) => {
                return dependence.extname === record.guide.extname && helper.compareArray(dependence.pathItems, [...record.guide.dirItems, record.guide.filename]);
            });
            if (record === undefined) {
                throw new Error(`IncRcord ${dependence.pathItems.join('/')}${dependence.extname} is not found.`);
            }
            record.content = preprocess(record.guide, incRecords, (guide, dependence, incRecords, originalText) => {
                return thisFunction(packageName, guide, dependence, incRecords, originalText);
            }).code;
            return record.getExpandsion();
        } else {
            throw new Error(`Extname ${guide.extname} is invaild.`);
        }
    } else {
        return originalText;
    }
}


/**
 * 
 * @param {String} basePath 
 * @param {String} packageName 
 * @returns {CxxDescriptor[]}
 */
function diveToProprocessAbseil(basePath, packageName) {
    return diveToProprocess(basePath, packageName, abseilGuideFilter, abseilLineConverter, abseilContentModifier);
}


/**
 * 
 * @param {String} basePath 
 * @param {String} packageName 
 * @returns {CxxDescriptor[]}
 */
function diveToProprocessProtobuf(basePath, packageName) {
    return diveToProprocess(basePath, packageName, protobufGuideFilter, protobufLineConverter, protobufContentModifier);
}

/**
 * 
 * @param {String} basePath 
 * @param {String} packageName 
 * @returns {CxxDescriptor[]}
 */
function diveToProprocessFlatbuffers(basePath, packageName) {
    return diveToProprocess(basePath, packageName, flatbuffersGuideFilter, flatbuffersLineConverter, flatbuffersContentModifier);
}

/**
 * 
 * @param {String} basePath 
 * @param {String} packageName 
 * @returns {CxxDescriptor[]}
 */
function diveToProprocessSimde(basePath, packageName) {
    return diveToProprocess(basePath, packageName, flatbuffersGuideFilter, simdeLineConverter, flatbuffersContentModifier);
}



module.exports = {
    gatherIncRecords,
    preprocess,
    diveToProprocessAbseil,
    diveToProprocessProtobuf,
    diveToProprocessFlatbuffers,
    diveToProprocessSimde,
    protobufLineConverter,
    protobufGuideFilter,
    protobufContentModifier,
}