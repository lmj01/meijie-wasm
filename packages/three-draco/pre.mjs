import { copyFiles, existFile } from '../tool/file.mjs'

const srcFolder1 = '../../cpp/build/draco/javascript/npm/draco3dgltf';
const dstFolder1 = './public/libs/draco';

const files = ['draco_encoder_gltf_nodejs.js', 'draco_encoder.wasm'];

files.forEach(file=>{
    const srcPath = `${srcFolder1}/${file}`;
    const dstPath = `${dstFolder1}/${file}`;
    copyFiles(srcPath, dstPath, [], {})    
})
console.log(new Date().toLocaleTimeString());