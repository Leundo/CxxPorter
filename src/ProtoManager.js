const path = require('node:path');
const fs = require('node:fs');

const { Dependence } = require('./Dependence.js');
const { FileGuide } = require('./FileManager.js');
const { CxxDescriptor } = require('./CxxDescriptor.js');
const { IncRecord } = require('./IncRecord.js');

const constant = require('./Constant.js');
const preprocessor = require('./Preprocessor.js');
const fileManager = require('./FileManager.js');



/**
 * 
 * @param {IncRecord[]} incRecords 
 */
function transformProto(records) {
    let guides = fileManager.dive(constant.protoPath);
    const descriptors = guides.filter(preprocessor.protobufGuideFilter).map((guide) => {
        return preprocessor.preprocess(guide, records, (guide, dependence, incRecords, originalText) => {
            return preprocessor.protobufLineConverter('CppProtobuf', guide, dependence, incRecords, originalText);
        }, preprocessor.protobufContentModifier);
    });
    
    
    for (const descriptor of descriptors) {
        let filename = `${descriptor.getPathItems().join('_')}`;
        if (['.h', '.hpp'].includes(descriptor.guide.extname)) {
            filename += '.hpp';
        } else if (['.c', '.cxx', '.cpp', '.cc'].includes(descriptor.guide.extname)) {
            filename += '.cpp';
        } else {
            filename += descriptor.guide.extname;
        }
        fs.writeFileSync(path.resolve(constant.protoPath, filename), descriptor.code, {encoder: 'utf8'});
    }
}


module.exports = {
    transformProto,
}