import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execAsync } from './common.mjs';

const THIRD_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../third/')

const UE5_DIR_NAME = 'ue5';
const UE5_DIR = path.resolve(THIRD_ROOT, UE5_DIR_NAME);

const MESHOPTIMIZER_DIR_NAME = 'meshoptimizer';
const MESHOPTIMIZER_DIR = path.resolve(THIRD_ROOT, MESHOPTIMIZER_DIR_NAME);

const MANIFOLD_DIR_NAME = 'manifold';
const MANIFOLD_DIR = path.resolve(THIRD_ROOT, MANIFOLD_DIR_NAME);

const VTK_DIR_NAME = 'vtk';
const VTK_DIR = path.resolve(THIRD_ROOT, VTK_DIR_NAME);

const VTKJS_DIR_NAME = 'vtk.js';
const VTKJS_DIR = path.resolve(THIRD_ROOT, VTKJS_DIR_NAME);

async function updateSubmoduleDraco() {
    // await execAsync(`git submodule init`);
    console.log(DRACO_DIR)
    await execAsync(`cd ${DRACO_DIR} && git submodule sync`);
    await execAsync(`cd ${DRACO_DIR} && git submodule update --init -f --recursive`);
}

const libs = [
    {
        name: 'meshoptimizer',
        url: 'https://github.com/zeux/meshoptimizer.git',
        tag: 'v0.22',
        dir: MESHOPTIMIZER_DIR,
        action: [],
        command: undefined
    },
    {
        name: 'ue5',
        url: 'git@github.com:EpicGames/UnrealEngine.git',
        tag: '5.5.1-release',
        dir: UE5_DIR,
        action: [],
        command: undefined
    },
    {
        name: 'manifold',
        url: 'https://github.com/elalish/manifold.git',
        tag: 'v3.0.1',
        dir: MANIFOLD_DIR,
        action: [],
        command: undefined
    },
    {
        name: 'vtk',
        url: 'https://gitlab.kitware.com/vtk/vtk.git',
        tag: 'v9.4.1',
        dir: VTK_DIR,
        action: [],
        command: undefined
    },
    {
        name: 'vtk.js',
        url: 'https://github.com/Kitware/vtk-js.git',
        tag: 'v32.9.0',
        dir: VTKJS_DIR,
        action: [],
        command: undefined
    }
]

async function setupLibs() {
    for (const lib of libs) {
        let isSsh = false, supportSsh = false;
        if (!fs.existsSync(lib.dir)) {
            console.log(`Cloning ${lib.name}...`);
            if (lib.url.startsWith('git@')) {
                isSsh = true;
                const code = await execAsync(`git ls-remote ${lib.url}`);
                supportSsh = code !== 1;
                console.warn(code, supportSsh)
            }
            if (!isSsh || isSsh && supportSsh) {

                await execAsync(`git clone --depth=1 -b ${lib.tag} ${lib.url} ${lib.dir}`);

                if (!fs.existsSync(lib.dir)) {
                    console.error(`Failed to clone ${lib.name}`);
                    process.exit(1);
                }
            }
        }
        if (!isSsh || isSsh && supportSsh) {
            console.log(`Seting up ${lib.name}...`);
            if (lib.command) {
                await execAsync(lib.command);
            }

            for (const action of lib.action) {
                await action();
            }
        }
    }
}

function main() {
    if (!fs.existsSync(THIRD_ROOT)) {
        fs.mkdirSync(THIRD_ROOT);
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
