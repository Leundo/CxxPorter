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
    'absl/log/absl_check',
    'absl/log/absl_log',
    'absl/log/die_if_null',
    'absl/log/log',

    
    'absl/hash_hash',

    'absl/strings/string_view',
    'absl/strings/internal/resize_uninitialized',
    'absl/strings/str_cat',
    'absl/strings/str_split',
    'absl/strings/str_replace',
    'absl/strings/str_join',
    'absl/strings/numbers',
    'absl/strings/match',
    'absl/strings/cord',

    'absl/debugging/internal/stacktrace_aarch64-inl',
    'absl/debugging/internal/stacktrace_arm-inl',
    'absl/debugging/internal/stacktrace_emscripten-inl',
    'absl/debugging/internal/stacktrace_generic-inl',
    'absl/debugging/internal/stacktrace_powerpc-inl',
    'absl/debugging/internal/stacktrace_riscv-inl',
    'absl/debugging/internal/stacktrace_unimplemented-inl',
    'absl/debugging/internal/stacktrace_win32-inl',
    'absl/debugging/internal/stacktrace_x86-inl',

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

    'absl/crc/crc32c',
    'absl/crc/internal/crc_x86_arm_combined',
    'absl/crc/internal/crc_memcpy_fallback',

    'absl/status/status',
    
    'absl/container/btree_map',
    'absl/container/btree_set',
    'absl/container/flat_hash_map',
    'absl/container/flat_hash_set',
    'absl/container/inlined_vector',
    'absl/container/node_hash_set',
    'absl/container/node_hash_map',
    'absl/container/internal/hashtablez_sampler_force_weak_definition',

    'absl/synchronization/mutex',

    'absl/random/internal/randen_round_keys',

    'absl/strings/match',
    'absl/strings/str_cat',
    'absl/base/attributes',
    'absl/container/internal/layout',
    'absl/synchronization/mutex',
    'absl/log/absl_check',
    'absl/numeric/bits',
    'absl/log/absl_log',
    'absl/strings/cord',
    'absl/container/flat_hash_set',
    'absl/strings/string_view',
    'absl/algorithm/container',
    'absl/types/span',
    'absl/types/optional',
    'absl/status/statusor',
    'absl/strings/str_split',
    'absl/strings/strip',
    'absl/container/btree_set',
    'absl/container/flat_hash_map',
    'absl/strings/str_format',
    'absl/strings/str_replace',
    'absl/strings/substitute',
    'absl/container/btree_map',
    'absl/status/status',
    'absl/memory/memory',
    'absl/strings/escaping',
    'absl/strings/ascii',
    'absl/strings/internal/string_constant',
    'absl/strings/str_join',
    'absl/base/casts',
    'absl/log/initialize',
    'absl/base/call_once',
    'absl/base/dynamic_annotations',
    'absl/functional/function_ref',
    'absl/hash/hash',
    'absl/types/variant',
    'absl/base/optimization',
    'absl/strings/internal/resize_uninitialized',
    'absl/cleanup/cleanup',
    'absl/meta/type_traits',
    'absl/strings/charconv',
    'absl/strings/numbers',
    'absl/strings/cord_buffer',
    'absl/random/random',
    'absl/base/config',
    'absl/base/prefetch',
    'absl/log/die_if_null',
    'absl/container/fixed_array',
    'absl/numeric/int128',
    'absl/time/clock',
    'absl/time/time'
    
];
const node = porter.findMinimalDependencyGraph(descriptors, urls, graph);
porter.generatorNodeFile(constant.abseilOutputPath, 'CppAbseil', '', descriptors, node);