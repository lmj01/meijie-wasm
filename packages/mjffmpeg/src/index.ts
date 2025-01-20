import {
    alias3, MqMultiViewEditor,
} from 'mjdraco/src/third/mq-render/viewer.es'
import 'tool/b5.theme'

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
function initLogic() {
    
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
    initLogic();
}
