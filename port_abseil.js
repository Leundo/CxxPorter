const path = require('node:path');
const fs = require('node:fs');

const fileManager = require('./src/FileManager.js');
const constant = require('./src/Constant.js');
const helper = require('./src/Helper.js');
const preprocessor = require('./src/Preprocessor.js');
const porter = require('./src/Porter.js');


const { FileGuide } = require('./src/FileManager.js');


const descriptors = preprocessor.diveToProprocessAbseil(constant.abseilSourcePath, 'CppAbseil');
const graph = porter.buildDependenceGraph(descriptors);

// console.log(graph.get('/Users/leundo/Swifter/Apps/KotodamaWorkshop/CxxPorter/source/abseil_20230802_1/absl/algorithm/algorithm.h'))

const urls = [
    'absl/log/absl/check',

    'absl/hash_hash',

    'absl/strings/string_view',
    'absl/strings/internal/resize_uninitialized',
    'absl/strings/str_cat',
    'absl/strings/str_split',
    'absl/strings/str_replace',
    'absl/strings/str_join',
    'absl/strings/numbers',
    'absl/strings/match',

    'absl/numeric/int128',

    'absl/time/time',
    'absl/time/format',
    'absl/time/duration',
    'absl/time/clock',

    'absl/time/internal/cctz/src/tzfile',
    'absl/time/internal/cctz/src/civil_time_detail',
    'absl/time/internal/cctz/src/time_zone_fixed',
    'absl/time/internal/cctz/src/time_zone_format',
    'absl/time/internal/cctz/src/time_zone_if',
    'absl/time/internal/cctz/src/time_zone_impl',
    'absl/time/internal/cctz/src/time_zone_info',
    'absl/time/internal/cctz/src/time_zone_libc',
    'absl/time/internal/cctz/src/time_zone_lookup',
    'absl/time/internal/cctz/src/time_zone_posix',
    'absl/time/internal/cctz/src/zone_info_source',

    'absl/types/span',
    'absl/types/optional',
    'absl/types/any',
];
const node = porter.findMinimalDependencyGraph(descriptors, urls, graph);
porter.generatorNodeFile(constant.abseilOutputPath, 'CppAbseil', '', descriptors, node);