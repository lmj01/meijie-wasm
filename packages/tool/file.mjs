import fs from 'fs';
/**
 * 
 * @param {*} sFolder 
 * @param {*} dFolder 
 * @param {*} excludeWord 
 * @param {*} options 
 */
export function copyFiles(sFolder, dFolder, excludeWord = [], options = {}) {
    if (options.dstClear) {
        if (fs.existsSync(dFolder)) {
            fs.rmSync(dFolder, {recursive: true});
        }
    }
    fs.cp(sFolder, dFolder, {
        recursive: true,
        filter: (path)=>{
            let cleanPath = path.replace('/', '\\');
            let pass = true;
            excludeWord.forEach(e=>{
                if (cleanPath.indexOf(e) > -1) pass = false;
            });
            return pass;
        },
    }, (err)=>{
        if (err) console.log(err);
    })
}

export function existFile(path) {
    return fs.existsSync(path);
}