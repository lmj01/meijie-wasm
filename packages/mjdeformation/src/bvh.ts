import 'tool/b5.theme';
import {
    alias3, MqMultiViewEditor, aliasBvh, PathLoader, bindDracoEncoder,
    rBufferToModel,
} from 'mjdraco/src/third/mq-render/viewer.es'
import mq45 from './assets/45.mq?url';
import mq46 from './assets/46.mq?url';
import mqUpper from './assets/upper.mq?url';
import mqLower from './assets/lower.mq?url';

let app: any = {
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
    const loader = new PathLoader(mq45, { drcPath: 'libs/draco/' })
    console.log(mq45)
    const paths = [mq45, mq46, mqUpper, mqLower];
    for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        let buffer = await loader.load(path);
        let mesh = await rBufferToModel({buffer}, {color});
        app3.add(mesh);
    }
    console.log(app)
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