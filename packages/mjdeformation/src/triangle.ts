import {
    alias3, MqMultiViewEditor, PathLoader, bindDracoEncoder,
    rBufferToModel,
} from 'mjdraco/src/third/mq-render/viewer.es'
import manifold from 'manifold-3d/manifold.js'
import manifoldWasm from 'manifold-3d/manifold.wasm?url';
import earcut, { deviation } from 'earcut';
import drc45 from './assets/45.drc?url';
import 'tool/b5.theme'

// https://manifoldcad.org/jsdocs/documents/Get_Started.html

const app3 = new MqMultiViewEditor();
let app: any = {
    meshes: [],
    markList: [],
    app3,
};
(<any>window).app = app;
const viewState = [
    // single scene
    {
        name: undefined,
        left: 0,
        bottom: 0,
        width: 1,
        height: 1,
        clearColor: new alias3.Color().setRGB(1, 1, 1),
        // background: new alias3.Color().setStyle('#cccccc'),
        scene: new alias3.Scene(),
    },
];
async function initManifold() {
    // https://github.com/donalffons/opencascade.js/issues/268
    const module = await manifold({
        locateFile: () => manifoldWasm,
    })
    console.log(module)
    module.setup();
    const { cube, sphere } = module.Manifold;
    const box = cube([10,10,10], true);
    const ball = sphere(6, 10);
    const res = box.subtract(ball);
    console.log(res, res.numVert(), res.numTri(), res.numProp(), res.numPropVert());
    console.log(res.originalID(), res.getMesh(res.originalID()))
    const meshOfManifold = res.getMesh(res.originalID());
    const geo = new alias3.BufferGeometry();
    geo.setAttribute('position', new alias3.BufferAttribute(meshOfManifold.vertProperties, meshOfManifold.numProp));
    const mesh3 = new alias3.Mesh(geo);
    app3.add(mesh3);
    // console.log(res.getMesh())
    // visit vertex
    // res.warp((v)=>{
    //     console.log(v);
    // })
}
async function infoTriangle(geo:any) {
    
    const position = geo.attributes.position;
    console.log('count', position)
    const color = new alias3.Color().setStyle('#FF0000');
    const triangles = earcut(position.array, [], 3);
    const deviate = deviation(position.array, [], 3, triangles);
    console.log('earcut deviation is ', deviate);
    for (let i = 0; i < triangles.length; i++) {
        geo.attributes.color.setXYZ(triangles[i], color.r, color.g, color.b);
    }
    geo.attributes.color.needsUpdate = true;
}
async function init() {
    const color = new alias3.Color().setStyle('#B1A298');
    const loader = new PathLoader(drc45, { drcPath: 'libs/draco/' })
    let geometry = await loader.load(drc45);
    let mesh = rBufferToModel({ buffer :geometry }, { color });
    mesh.visible = true;
    mesh.translateX(20);
    app3.add(mesh);
    infoTriangle(geometry);
}
function setupUI() {
    const btn = document.createElement('button');
    btn.classList.add('btn', 'btn-primary');
    btn.style.cssText = `position:fixed;top:50px;right:20px;`;
    btn.textContent = 'test style';
    document.body.appendChild(btn);
}
window.onload = () => {
    bindDracoEncoder(`libs/draco/draco_encoder.js`);
    const elApp = document.getElementById('app');
    const elRc = elApp?.getBoundingClientRect();
    app3.init({
        width: elRc?.width,
        height: elRc?.height,
        container: elApp,
        useControl: true,
        cameraPositionZ: 300.0,
        useGrid: true,
        themeGrid: 1,
        viewStateList: viewState,
    },);
    app3.callAnimate();
    app3.updateFrame();
    app3.setAxes(0.5, 2e-3, { textScaleFactor: 0.1 });
    init();    
    setupUI();
    initManifold();
}