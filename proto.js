const protoManager = require('./src/ProtoManager.js');
const fileManager = require('./src/FileManager.js');
const processor = require('./src/Preprocessor.js');
const constant = require('./src/Constant.js');


let guides = fileManager.dive(constant.protobufSourcePath);
let records = processor.gatherIncRecords(guides);
protoManager.transformProto(records);