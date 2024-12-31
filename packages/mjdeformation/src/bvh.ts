import 'tool/b5.theme';
import {
    alias3, MqMultiViewEditor, aliasBvh, PathLoader, bindDracoEncoder,
    rBufferToModel,
} from 'mjdraco/src/third/mq-render/viewer.es'
import { createMarkSphere } from 'mjdraco/src/third/mq-tool/tool.es'
import drc45 from './assets/45.drc?url';
import drc46 from './assets/46.drc?url';
import drcUpper from './assets/upper.drc?url';
import drcLower from './assets/lower.drc?url';

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
async function init() {
    const color = new alias3.Color().setStyle('#B1A298');
    const loader = new PathLoader(drc45, { drcPath: 'libs/draco/' })
    const paths = [drc45, drc46, drcUpper, drcLower];
    const names = ['45', '46', 'upper', 'lower'];
    for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        let buffer = await loader.load(path);
        let mesh = await rBufferToModel({ buffer }, { color });
        mesh.name = names[i];
        mesh.visible = false;
        if (mesh.geometry.computeBoundsTree) mesh.geometry.computeBoundsTree();
        app3.add(mesh);
        app.meshes.push(mesh);
    }
    const mSrc = app3.findByName('45')[0], mDst = app3.findByName('upper')[0];
    mSrc.visible = true;
    mDst.visible = true;
    const bvhSrc = mSrc.geometry.computeBoundsTree();
    const bvhDst = mDst.geometry.computeBoundsTree();
    console.log(mSrc, mDst, bvhSrc, bvhDst)
    const hitColor = new alias3.Color().setStyle('#ff0000');
    app.markList.slice();
    const transformMatrix = new alias3.Matrix4().copy(mSrc.matrixWorld).invert();
    const hit = mDst.geometry.boundsTree.intersectsGeometry(mSrc.geometry, transformMatrix);
    console.log(hit)
    if (hit) {
        const srcPositions = mDst.geometry.attributes.position;
        const toMatUpper = new alias3.Matrix4().copy(mSrc.matrixWorld).invert();
        console.log(toMatUpper)
        let overlapSrc = new alias3.Box3();
        let overlapDst = new alias3.Box3();
        overlapSrc.setFromObject(mSrc);
        overlapDst.setFromObject(mDst);
        overlapSrc = overlapSrc.intersect(overlapDst);
        console.log(overlapSrc)

        let vPos = new alias3.Vector3();
        let closest: any = {}, info;
        let t1 = Date.now();
        for (let i = 0; i < srcPositions.count; i += 3) {
            vPos.fromArray(srcPositions.array, i);
            vPos.applyMatrix4(toMatUpper);
            const isIn = overlapSrc.containsPoint(vPos);
            if (isIn) {
                closest = bvhSrc.closestPointToPoint(vPos, closest);
                if (closest) {
                    info = aliasBvh.getTriangleHitPointInfo(closest.point, mSrc.geometry, closest.faceIndex, info);
                    let inside = info.face.normal.dot(vPos.sub(closest.point)) > 0;
                    if (inside) {
                        const mark = createMarkSphere(alias3, {point: closest.point, sphereRadius: 0.01, useCache: true});
                        app.markList.push(mark);
                        app3.add(mark);
                    }
                    console.log(info, inside, closest);
                    // mSrc.geometry.index
                    // mSrc.geometry.attributes.color.setXYZ(closest.faceIndex, hitColor.r, hitColor.g, hitColor.b);
                }
            }
        }
        // mSrc.geometry.attributes.color.needsUpdate = true;
        let t2 = Date.now();
        console.log(t2-t1, t1, t2);
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