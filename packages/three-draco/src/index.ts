import { MqMultiViewEditor, alias3, PathLoader, geometry2Mesh } from './third/mq-render/viewer.es'
import drcBunny from './assets/bunny.drc?url';
const app3 = new MqMultiViewEditor();
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

async function loadModel(path:string) {
    const loader = new PathLoader(path, {drcPath:'libs/draco/'});
    const geo = await loader.load(path, function(){        
        const e = arguments[0];
        console.log(e);
    });
    const mesh = geometry2Mesh(geo);
    mesh.scale.multiplyScalar(100);
    console.log(mesh)
    app3.add(mesh);
}

window.onload = ()=>{
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
    }, );
    app3.callAnimate();
    app3.updateFrame();
    app3.setAxes(0.5, 2e-3, {textScaleFactor: 0.1});
    console.log('onload', elApp)
    loadModel(drcBunny);
}