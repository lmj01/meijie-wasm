import fs from 'fs';
import sass from 'sass';

export function parseFile(srcPath, dstPath, options={hasMap:false, compress:false}) {
    const result = sass.compile(srcPath, {
        style:options.compress ? 'expanded' : 'compressed', 
        sourceMap: options.hasMap
    });
    let dstMapPath = `${dstPath}.map`;
    if (fs.existsSync(dstPath)) fs.rmSync(dstPath);
    if (fs.existsSync(dstMapPath)) fs.rmSync(dstMapPath);

    fs.writeFileSync(dstPath, result.css, (err) => err && console.log(err));
    if (options.hasMap) fs.writeFileSync(dstMapPath, JSON.stringify(result.sourceMap), (err) => err && console.log(err));
}

const retainType = process.env.npm_lifecycle_event
console.log('-css build command-', retainType);
parseFile('./styles/demo.three.scss', `../mjdraco/index.css`, {hasMap: true, compress:true});
parseFile('./styles/demo.three.scss', `../mjdeformation/index.css`, {hasMap: true, compress:true});
parseFile('./styles/demo.three.scss', `../mjbit2/index.css`, {hasMap: true, compress:true});
parseFile('./styles/demo.page.scss', `../mjpage/index.css`, {hasMap: true, compress:true});