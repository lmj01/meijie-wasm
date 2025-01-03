import { BitByBitBase, Inputs } from '@bitbybit-dev/threejs'
import { OccStateEnum } from '@bitbybit-dev/occt-worker'
import { alias3, MqMultiViewEditor, aliasBvh, mesh2stl } from 'mjdraco/src/third/mq-render/viewer.es'
let app: any = {
    t1: new aliasBvh.ExtendedTriangle(),
    t2: new aliasBvh.ExtendedTriangle(),
    intersectionMesh: new alias3.Mesh(new alias3.CylinderGeometry()),
    addRadiusNarrow: 0,
    addRadiusWide: 0,
    addTopHeight: 0,
    addMiddleHeight: 0,
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
    app.vase = {} as Inputs.OCCT.TopoDSShapePointer;
    app.shapesToClean = [] as Array<Inputs.OCCT.TopoDSShapePointer>;
    
    app.bitbybit = new BitByBitBase();
    const occt = new Worker(new URL('./occ.worker', import.meta.url), {name: 'OCC', type: 'module'});
    const jscad = new Worker(new URL('./jscad.worker', import.meta.url), {name: 'JSCAD', type: 'module'});
    await app.bitbybit.init(viewState[0].scene, occt, jscad);
    
    app.bitbybit.occtWorkerManager.occWorkerState$.subscribe(async (s:any)=>{
        if (s.state == OccStateEnum.initialised) {
            await createVaseByLoft();
        } else if (s.state == OccStateEnum.computing) {

        } else if (s.state == OccStateEnum.loaded) {
            
        }
    })  
}
async function createVaseByLoft() {
    if (app.bitbybit) {
        if (app.vase) {
            await app.bitbybit.occt.deleteShape({shape:app.vase});
            await app.bitbybit.occt.deleteShapes({shapes:app.shapesToClean});
        }
        const wire1 = await app.bitbybit.occt.shapes.wire.createCircleWire({
            radius: 10 + app.addRadiusNarrow,
            center: [0, 0, 0],
            direction: [0, 1, 0]
        })
        const wire2 = await app.bitbybit.occt.shapes.wire.createEllipseWire({
            radiusMinor: 20 + app.addRadiusWide,
            radiusMajor: 25 + app.addRadiusWide,
            center: [0, 20 + app.addMiddleHeight, 0],
            direction: [0, 1, 0]
        });
        const wire3 = await app.bitbybit.occt.shapes.wire.createCircleWire({
            radius: 10 + app.addRadiusNarrow,
            center: [0, 30 + app.addMiddleHeight, 0],
            direction: [0, 1, 0]
        });
        const wire4 = await app.bitbybit.occt.shapes.wire.createCircleWire({
            radius: 15 + app.addRadiusWide,
            center: [0, 40 + app.addMiddleHeight + app.addTopHeight, 0],
            direction: [0, 1, 0.1]
        });
        const lAdvOpt = new Inputs.OCCT.LoftAdvancedDto([wire1, wire2, wire3, wire4]);
        const loft = await app.bitbybit.occt.operations.loftAdvanced(lAdvOpt);
        const loftFace = await app.bitbybit.occt.shapes.face.getFace({ shape: loft, index: 0 });
        const baseFace = await app.bitbybit.occt.shapes.face.createFaceFromWire({ shape: wire1, planar: true });
        const shell = await app.bitbybit.occt.shapes.shell.sewFaces({ shapes: [loftFace, baseFace], tolerance: 1e-7 });
        const fillet = await app.bitbybit.occt.fillets.filletEdges({ shape: shell, radius: 10 });
        const thick = await app.bitbybit.occt.operations.makeThickSolidSimple({ shape: fillet, offset: -2 })
        const finalVase = await app.bitbybit.occt.fillets.chamferEdges({ shape: thick, distance: 0.3 });

        app.shapesToClean = [wire1, wire2, wire3, wire4, loft, loftFace, baseFace, shell, fillet, thick];

        const options = new Inputs.Draw.DrawOcctShapeOptions();
        options.precision = 0.05;
        options.drawEdges = true;
        options.drawFaces = true;
        options.drawVertices = false;
        options.edgeWidth = 20;
        options.edgeColour = "#000000";


        const mat = new alias3.MeshPhongMaterial({ color: 0x6600ff });
        mat.polygonOffset = true;
        mat.polygonOffsetFactor = 3;
        options.faceMaterial = mat;
        const group = await app.bitbybit.draw.drawAnyAsync({ entity: finalVase, options });


        group.children[0].children.forEach((child:any) => {
            child.castShadow = true;
            child.receiveShadow = true;
        });

        app.vase = finalVase;
    }
}
function toStl() {
    const str = mesh2stl(viewState[0].scene);
    console.log(str);
}
async function toStep() {
    if (app.bitbybit) {
        await app.bitbybit.occt.io.saveShapeSTEP({
            shape: app.vase,
            fileName: 'vase.stp',
            adjustYtoZ: true,
            tryDownload: true,
        })
    }
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
    init();   
}
