import {
    alias3, MqMultiViewEditor,
} from 'mjdraco/src/third/mq-render/viewer.es'
import manifold from 'manifold-3d/manifold.js'
import manifoldWasm from 'manifold-3d/manifold.wasm?url';
import { Manifold } from 'manifold-3d/manifold-encapsulated-types'
import earcut, { deviation } from 'earcut';
import 'tool/b5.theme'

// https://manifoldcad.org/jsdocs/documents/Get_Started.html

const app3 = new MqMultiViewEditor();
let app: any = {
    meshes: [],
    markList: [],
    app3,
    opIdx: 0,
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
const cMaterials = [
    new alias3.MeshBasicMaterial({ 
        color: new alias3.Color().setStyle('#ff0000'), 
        side: alias3.DoubleSide,
    }),
    new alias3.MeshBasicMaterial({ 
        color: new alias3.Color().setStyle('#00ff00'), 
        side: alias3.DoubleSide,
    }),
    new alias3.MeshBasicMaterial({ 
        color: new alias3.Color().setStyle('#0000ff'), 
        side: alias3.DoubleSide,
    }),
]
const cOptions = ['union','difference','intersection'];
function manifold2Mesh3(index: number, mainfold: Manifold) {
    // visit vertex
    // mainfold.warp((v)=>{
    //     console.log(v);
    // })    
    const id = mainfold.originalID();
    const mesh = mainfold.getMesh(id);
    const geo = new alias3.BufferGeometry();
    geo.setAttribute('position', new alias3.BufferAttribute(mesh.vertProperties, 3));
    geo.setIndex(new alias3.BufferAttribute(mesh.triVerts, 1))
    const mesh3 = new alias3.Mesh(geo, cMaterials[index]);
    // console.log(id, mesh, geo);
    return mesh3;
}
async function initManifold() {
    // https://github.com/donalffons/opencascade.js/issues/268
    const module = await manifold({
        locateFile: () => manifoldWasm,
    })
    console.log(module)
    // console.log(new alias3.BoxGeometry(5,5))
    module.setup();
    const { cube, sphere } = module.Manifold;
    const box = cube([10, 10, 10], true);
    const ball = sphere(6, 10);
    const mesh3Box = manifold2Mesh3(0, box);
    mesh3Box.translateY(20);
    app3.add(mesh3Box);
    const mesh3Ball = manifold2Mesh3(1, ball);
    mesh3Ball.translateY(-20);
    app3.add(mesh3Ball);

    function csg() {
        const opName = cOptions[app.opIdx];
        const mesh = module.Manifold[opName](box, ball).getMesh();
        // console.log(mesh);
        app3.remove('opMesh');    
        const geo = new alias3.BufferGeometry();
        geo.setAttribute('position', new alias3.BufferAttribute(mesh.vertProperties, 3));
        geo.setIndex(new alias3.BufferAttribute(mesh.triVerts, 1))
        const mesh3 = new alias3.Mesh(geo, cMaterials[2]);
        mesh3.name = 'opMesh';
        app3.add(mesh3);
    }
    csg();
    document.getElementById('opSelect')?.addEventListener('change', (event)=>{
        app.opIdx = event.target?.selectedIndex;
        csg();
    })
}
async function infoTriangle(geo: any) {

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
function setupUI() {
    const select = document.createElement('select');
    select.id='opSelect';
    select.classList.add('form-select', 'form-select-sm');
    select.style.cssText = `position:fixed;top:50px;right:20px;width:160px;`;
    cOptions.forEach((opt,index)=>{
        const elOpt = document.createElement('option');
        elOpt.setAttribute('value', `${index}`);
        elOpt.textContent = opt;
        select.options.add(elOpt);
    })
    document.body.appendChild(select);
}
window.onload = () => {
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
    setupUI();
    initManifold();
}