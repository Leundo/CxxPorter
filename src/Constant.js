const path = require('node:path');

const abseilSourcePath = path.resolve(__dirname, '../source/abseil_20230802_1/');
const abseilOutputPath = path.resolve(__dirname, '../build/abseil_20230802_1/');
const protobufSourcePath = path.resolve(__dirname, '../source/protobuf_25_2/');
const protobufOutputPath = path.resolve(__dirname, '../build/protobuf_25_2/');

const protoPath = path.resolve(__dirname, '../proto');


module.exports = {
    abseilSourcePath,
    abseilOutputPath,
    protobufSourcePath,
    protobufOutputPath,
    protoPath,
};