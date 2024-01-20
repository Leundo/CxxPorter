const path = require('node:path');
const fs = require('node:fs');

const fileManager = require('./src/FileManager.js');
const constant = require('./src/Constant.js');
const helper = require('./src/Helper.js');
const preprocessor = require('./src/Preprocessor.js');
const porter = require('./src/Porter.js');


const { FileGuide } = require('./src/FileManager.js');

const descriptors = preprocessor.diveToProprocessFlatbuffers(constant.flatbuffersSourcePath, 'CppFlatbuffers');
const graph = porter.buildDependenceGraph(descriptors);


const urls = null;

const node = porter.findMinimalDependencyGraph(descriptors, urls, graph);
porter.generatorNodeFile(constant.flatbuffersOutputPath, 'CppFlatbuffers', '', descriptors, node);