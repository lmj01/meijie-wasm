import { loadJavaScriptFile } from 'tool/dom'
import { alias3, MqMultiViewEditor, aliasBvh } from 'mjdraco/src/third/mq-render/viewer.es'
let gDeformationModule:any;
let app: any = {
    t1: new aliasBvh.ExtendedTriangle(),
    t2: new aliasBvh.ExtendedTriangle(),
    intersectionMesh: new alias3.Mesh(new alias3.CylinderGeometry()),
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
function init() {
    app.t1.a.set( - 1, 0, 0 );
    app.t1.b.set( 2, 0, - 2 );
    app.t1.c.set( 2, 0, 2 );
    app.t2.a.set( 1, 0, 0 );
    app.t2.b.set( - 2, - 2, 0 );
    app.t2.c.set( - 2, 2, 0 );
    app.t1.needsUpdate = true;
    app.t2.needsUpdate = true;

    app.intersectionMesh.material = new alias3.MeshPhongMaterial({
        color: 0xff000,
        side: alias3.DoubleSide,
    })
    console.log(app)
}
window.onload = () => {
    loadJavaScriptFile(`libs/meijie/deformation-wasm.js`, async () => {
        // console.log(Module)
        // gDeformationModule = await DracoEncoderModule();
        // console.log('wasm', gDeformationModule)
        // app.encoderModule = gDeformationModule;
    });
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