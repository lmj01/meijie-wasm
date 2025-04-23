import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execAsync } from './common.mjs';

const CPP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../cpp/')
const BUILD_DIR = path.resolve(CPP_ROOT, 'build');
const ENTT_DIR = path.resolve(CPP_ROOT, 'entt/entt');
const BGFX_DIR = path.resolve(CPP_ROOT, 'bgfx');
const CAD_DIR = path.resolve(CPP_ROOT, 'cad');
const SOLVESPACE_ROOT_DIR = path.resolve(CPP_ROOT, 'solvespace');
const DRACO_DIR = path.resolve(CPP_ROOT, 'draco');

const EMSDK_DIR_NAME = 'emsdk';
const EMSDK_DIR = path.resolve(BUILD_DIR, EMSDK_DIR_NAME);

const DRACO_DIR_NAME = 'draco';
const DRACO_LIB_DIR = path.resolve(DRACO_DIR, DRACO_DIR_NAME);

const MANIFOLD_NAME = 'manifold';
const MANIFOLD_DIR = path.resolve(BUILD_DIR, MANIFOLD_NAME);

const SOLVESPACE_DIR_NAME = 'solvespace';
const SOLVESPACE_DIR = path.resolve(SOLVESPACE_ROOT_DIR, SOLVESPACE_DIR_NAME);

const BGFX_APP_DIR_NAME = 'app';
const BGFX_APP_DIR = path.resolve(BGFX_DIR, BGFX_APP_DIR_NAME);

/**
 * Due to a WebXR error, we need to use --skipLibCheck
 */
async function fixEmscripten() {
    let file = path.resolve(EMSDK_DIR, 'upstream/emscripten/tools/emscripten.py');
    let contents = fs.readFileSync(file, 'utf8');
    contents = contents.replace(
        `cmd = tsc + ['--outFile', tsc_output_file, '--declaration', '--emitDeclarationOnly', '--allowJs', js_doc_file]`,
        `cmd = tsc + ['--outFile', tsc_output_file, '--declaration', '--skipLibCheck', '--emitDeclarationOnly', '--allowJs', js_doc_file]`
    );
    fs.writeFileSync(file, contents, 'utf8');

    console.log(`Fixed emscripten.py`);
}

async function updateSubmoduleSolvespace() {
    console.log('handle draco action', `${SOLVESPACE_DIR}`); 
    await execAsync(`cd ${SOLVESPACE_DIR} && git submodule sync`);
    await execAsync(`cd ${SOLVESPACE_DIR} && git submodule update --init -f --recursive`);
}
async function updateSubmoduleDraco() {
    console.log('handle draco action', `${DRACO_LIB_DIR}`); 
    await execAsync(`cd ${DRACO_LIB_DIR} && git submodule sync`);
    await execAsync(`cd ${DRACO_LIB_DIR} && git submodule update --init -f --recursive`);
}

const libs = [
    {
        name: 'emscripten',
        url: 'https://github.com/emscripten-core/emsdk.git',
        tag: '3.1.65',
        dir: EMSDK_DIR,
        action: [fixEmscripten],
        action: [],
        command: `${EMSDK_DIR}/emsdk install latest && ${EMSDK_DIR}/emsdk activate latest && cd ${EMSDK_DIR}/upstream/emscripten && npm i`
    },
    {
        name: 'draco',
        url: 'https://github.com/google/draco.git',
        tag: '1.5.7',
        // url: 'https://github.com/lmj01/draco.git',
        // tag: '8786740086a9f4d83f44aa83badfbea4dce7a1b5',        
        dir: DRACO_LIB_DIR,
        action: [updateSubmoduleDraco],
        command: undefined,
    },
    {
        name: 'entt',
        url: 'https://github.com/skypjack/entt.git',
        tag: 'v3.15.0',
        dir: ENTT_DIR,
        action: [],
        command: undefined,
    },
    {
        name: 'manifold',
        url: 'https://github.com/elalish/manifold.git',
        tag: 'v3.0.1',
        dir: MANIFOLD_DIR,
        action: [updateSubmoduleSolvespace],
        command: undefined,
    },
    {
        name: 'manifold',
        url: 'https://github.com/solvespace/solvespace.git',
        tag: 'v3.1',
        dir: SOLVESPACE_DIR,
        action: [],
        command: undefined,
    }
]

async function setupLibs() {
    for (const lib of libs) {
        if (!fs.existsSync(lib.dir)) {
            console.log(`Cloning ${lib.name}...`);
            await execAsync(`git clone --depth=1 -b ${lib.tag} ${lib.url} ${lib.dir}`);

            if (!fs.existsSync(lib.dir)) {
                console.error(`Failed to clone ${lib.name}`);
                process.exit(1);
            }
        }

        console.log(`Seting up ${lib.name}...`);
        if (lib.command) {
            await execAsync(lib.command);
        }

        for (const action of lib.action) {
            await action();
        }
    }
}

function main() {
    if (!fs.existsSync(BUILD_DIR)) {
        fs.mkdirSync(BUILD_DIR);
    }
    
    setupLibs()
        .then(e => {
            console.log('Setup complete');
        })
        .catch(err => {
            console.error(err);
        });
}

main();
