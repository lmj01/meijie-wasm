import { copyFiles, existFile } from '../tools/file.mjs'

const srcFolder1 = './dist/mq.webui.es.js';
const dstFolder1 = 'F:/masteralign/viewer-ct/src/third/mq-webui/mq.webui.es.js';

if (existFile(srcFolder1)) copyFiles(srcFolder1, dstFolder1, [], {})

console.log(new Date().toLocaleTimeString());