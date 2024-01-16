const path = require('node:path');
const fs = require('node:fs');

const fileManager = require('./src/FileManager.js');
const constant = require('./src/Constant.js');
const helper = require('./src/Helper.js');
const preprocessor = require('./src/Preprocessor.js');
const porter = require('./src/Porter.js');


const { FileGuide } = require('./src/FileManager.js');


const descriptors = preprocessor.diveToProprocessProtobuf(constant.protobufSourcePath, 'CppProtobuf');
const graph = porter.buildDependenceGraph(descriptors);


const urls = [
    'google/protobuf/port_def',
    'google/protobuf/port_undef',
    'google/protobuf/io/coded_stream',
    'google/protobuf/arena',
    'google/protobuf/arenastring',
    'google/protobuf/generated_message_tctable_decl',
    'google/protobuf/generated_message_util',
    'google/protobuf/metadata_lite',
    'google/protobuf/generated_message_reflection',
    'google/protobuf/message',
    'google/protobuf/repeated_field',
    'google/protobuf/extension_set',
    'google/protobuf/unknown_field_set',
    'google/protobuf/wire_format_lite',
    'google/protobuf/descriptor',
    'google/protobuf/generated_message_reflection',
    'google/protobuf/reflection_ops',
    'google/protobuf/wire_format',
    'google/protobuf/generated_message_tctable_impl',

    'google/protobuf/util/type_resolver_util',
    'google/protobuf/util/time_util',
    'google/protobuf/util/message_differencer',
    'google/protobuf/util/delimited_message_util',
    'google/protobuf/util/field_comparator',
    'google/protobuf/util/field_mask_util',
    'google/protobuf/util/json_util',
    'google/protobuf/util/json_util',

    'google/protobuf/extension_set_heavy',
    'google/protobuf/extension_set_heavy',
    'google/protobuf/any_lite',
    'google/protobuf/generated_message_tctable_full',
    'google/protobuf/generated_message_tctable_lite',
];
const node = porter.findMinimalDependencyGraph(descriptors, urls, graph);
porter.generatorNodeFile(constant.protobufOutputPath, 'CppProtobuf', '', descriptors, node);