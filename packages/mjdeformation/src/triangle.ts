import 'tool/b5.theme';
import {
    alias3, MqMultiViewEditor, aliasBvh, PathLoader, bindDracoEncoder,
    rBufferToModel,
} from 'mjdraco/src/third/mq-render/viewer.es'
import { createMarkSphere } from 'mjdraco/src/third/mq-tool/tool.es'

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
    // 
    const options = {
        // xCenter: -0.9,
        // yCenter: 0.4,
        xScale: 10,
        yScale: Math.floor(app3.rc.height / 2),
        xPos: -Math.floor(app3.rc.width / 2 * 0.95),
    } || {}
    const lut = new alias3.Lut()
    lut.addColorMap('colorbar', [
        [0.0, 0x0000ff], 
        [0.5, 0x00FF00],
        [1, 0xFF0000], 
    ]);
    lut.setColorMap('colorbar', 42);
    lut.setMin(-1.5);
	lut.setMax(0);
    const sprite = new alias3.Sprite( new alias3.SpriteMaterial( {
        map: new alias3.CanvasTexture( lut.createCanvas(20) )
    } ) );
    sprite.center.set(options.xCenter || 0.5, options.yCenter || 0.5);
    sprite.position.set(options.xPos || 0.5, options.yPos || 0, options.zPos || 0);
    sprite.scale.set(options.xScale || 0.5, options.yScale || 1, options.zScale || 1);
    sprite.name = `ui_overlap`;
    sprite.visible = true;    
    app3.addUi(sprite);

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
    mDst.visible = false;
    const bvhSrc = mSrc.geometry.computeBoundsTree();
    const bvhDst = mDst.geometry.computeBoundsTree();
    console.log(mSrc, mDst, bvhSrc, bvhDst)
    // const hitColor = new alias3.Color().setStyle('#ff0000');
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
        let bboxSize = new alias3.Vector3();
        overlapSrc.getSize(bboxSize);
        console.log(overlapSrc, bboxSize)
        
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
                        // const mark = createMarkSphere(alias3, {point: closest.point, sphereRadius: 0.01});
                        // app.markList.push(mark);
                        // app3.add(mark);
                    }
                    // console.log(info, inside, closest);
                    // mSrc.geometry.index
                    // console.log(closest.distance);
                    const hitColor = lut.getColor(closest.distance - bboxSize.z/2);
                    mSrc.geometry.attributes.color.setXYZ(info.face.a, hitColor.r, hitColor.g, hitColor.b);
                    mSrc.geometry.attributes.color.setXYZ(info.face.b, hitColor.r, hitColor.g, hitColor.b);
                    mSrc.geometry.attributes.color.setXYZ(info.face.c, hitColor.r, hitColor.g, hitColor.b);
                }
            }
        }
        mSrc.geometry.attributes.color.needsUpdate = true;
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