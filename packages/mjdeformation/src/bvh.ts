import 'tool/b5.theme';
import {
    alias3, MqMultiViewEditor, aliasBvh, PathLoader, bindDracoEncoder,
    rBufferToModel,
} from 'mjdraco/src/third/mq-render/viewer.es'
import drc45 from './assets/45.drc?url';
import drc46 from './assets/46.drc?url';
import drcUpper from './assets/upper.drc?url';
import drcLower from './assets/lower.drc?url';

let app: any = {
    meshes: [],
};
const app3 = new MqMultiViewEditor();
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
async function init() {
    const color = new alias3.Color().setStyle('#B1A298');
    const loader = new PathLoader(drc45, { drcPath: 'libs/draco/' })
    const paths = [drc45, drc46, drcUpper, drcLower];
    const names = ['45', '46', 'upper', 'lower'];
    for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        let buffer = await loader.load(path);
        let mesh = await rBufferToModel({buffer}, {color});
        mesh.name = names[i];
        mesh.visible = false;
        if (mesh.geometry.computeBoundsTree) mesh.geometry.computeBoundsTree();        
        app3.add(mesh);
        app.meshes.push(mesh);
    }
    const m45 = app3.findByName('45')[0], mupper = app3.findByName('upper')[0];
    m45.visible = true;
    mupper.visible = true;
    console.log(m45, mupper)
    const hitColor = new alias3.Color().setStyle('#ff0000');
    const transformMatrix = new alias3.Matrix4().copy( m45.matrixWorld ).invert();
    const hit = mupper.geometry.boundsTree.intersectsGeometry( m45.geometry, transformMatrix );
    console.log(hit)
    if (hit) {
        const pointOn45 = {}, pointOnUpper = {};
        const bvh45 = new aliasBvh.MeshBVH(m45.geometry), bvhupper = new aliasBvh.MeshBVH(mupper.geometry);
        
        bvh45.closestPointToGeometry(mupper.geometry, mupper.matrixWorld, pointOn45, pointOnUpper);
        console.log(pointOn45, pointOnUpper)
        const srcPositions = mupper.geometry.attributes.position;
        console.log(bvh45.geometry.boundingBox, bvhupper.geometry.boundingBox);
        const toMatUpper = new alias3.Matrix4().copy(m45.matrixWorld).invert();
        console.log(toMatUpper)
        let vPos = new alias3.Vector3();                
        for (let i = 0; i < srcPositions.count; i+=3) {
            vPos.fromArray(srcPositions.array, i);
            vPos.applyMatrix4(toMatUpper);
            const target:any = bvh45.closestPointToPoint(vPos, {}, -1.5);
            if (target && target.distance < 0.1) {
                // const idx = m45.geometry.index.array[target.faceIndex];
                m45.geometry.attributes.color.setXYZ(target.faceIndex, hitColor.r, hitColor.g, hitColor.b);                
                // console.log(target, idx);
            } else {
                // console.log(i);
            }
        }
        m45.geometry.attributes.color.needsUpdate = true;
    }
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
}