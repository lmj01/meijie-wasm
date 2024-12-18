import { MqMultiViewEditor, alias3, PathLoader, geometry2Mesh } from './third/mq-render/viewer.es'
import { loadJavaScriptFile, toLocalFile } from '../../tool/dom'
// import DracoEncoderModule from './assets/draco/draco_encoder_gltf_nodejs';
import drcBunny from './assets/bunny.drc?url';
// import drcBunny from './assets/bunny1734507496778.drc?url';
const app3 = new MqMultiViewEditor();
let gDracoEncoderModule: any;
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

async function loadModel(path: string) {
    const loader = new PathLoader(path, { drcPath: 'libs/draco/' });
    const geo = await loader.load(path, function () {
        const e = arguments[0];
        console.log(e);
    });
    const mesh = geometry2Mesh(geo);
    mesh.name = 'bunny';
    mesh.scale.multiplyScalar(100);
    console.log(mesh)
    app3.add(mesh);
}

async function encodeGeometry(geo: any) {
    if (!gDracoEncoderModule) return;
    console.log(gDracoEncoderModule)
    const encoder = new gDracoEncoderModule.Encoder();
    const meshBuilder = new gDracoEncoderModule.MeshBuilder();
    // Create a mesh object for storing mesh data.
    const newMesh = new gDracoEncoderModule.Mesh();

    const geoIndex = geo.index;
    const numFaces = geoIndex.array.length;
    const geoPosition = geo.attributes.position;
    const numPoints = geoPosition.array.length;
    const numIndices = numFaces * 3;
    const indices = new Uint32Array(numIndices);

    console.log("Number of faces " + numFaces);
    console.log("Number of vertices " + numPoints);

    // Add Faces to mesh
    for (let i = 0; i < numFaces; i++) {
        indices[i] = geoIndex.array.at(i);
    }
    meshBuilder.AddFacesToMesh(newMesh, numFaces, indices);

    console.log(Object.keys(geo.attributes))
    const attrs = { POSITION: 3, NORMAL: 3, COLOR: 3, TEX_COORD: 2 };

    Object.keys(geo.attributes).forEach((attr) => {
        const srcAttribute = geo.attributes[attr];
        let attrType = gDracoEncoderModule['GENERIC'];
        if (attr == 'position') attrType = gDracoEncoderModule['POSITION'];
        else if (attr == 'normal') attrType = gDracoEncoderModule['NORMAL'];
        else if (attr == 'color') attrType = gDracoEncoderModule['COLOR'];
        else if (attr == 'uv') attrType = gDracoEncoderModule['TEX_COORD'];
        console.log(srcAttribute)
        const attributeDataArray = new Float32Array(srcAttribute.count);
        for (let i = 0; i < srcAttribute.count; ++i) {
            attributeDataArray[i] = srcAttribute.array.at(i);
        }
        console.log(attrType, attr, attributeDataArray)
        meshBuilder.AddFloatAttributeToMesh(newMesh, attrType, srcAttribute.count,
            srcAttribute.itemSize, attributeDataArray);
    });

    // add uv
    if (true) {
        const attrP = geo.attributes.position;
        const attributeDataArray = new Float32Array(attrP.count);
        for (let i = 0; i < attrP.count; ++i) {
            attributeDataArray[i] = 0.5;
        }
        meshBuilder.AddFloatAttributeToMesh(newMesh, gDracoEncoderModule['TEX_COORD'], attrP.count,
            0, attributeDataArray);
        console.log('uv',attributeDataArray)
    }
    // add extra data
    if (true) {
        const attrP = geo.attributes.position;
        const attributeDataArray = new Float32Array(attrP.count);
        for (let i = 0; i < attrP.count; ++i) {
            attributeDataArray[i] = 0.1;
        }
        meshBuilder.AddFloatAttributeToMesh(newMesh, gDracoEncoderModule['GENERIC'], attrP.count,
            0, attributeDataArray);
        console.log('generic',attributeDataArray)
    }

    let encodedData = new gDracoEncoderModule.DracoInt8Array();
    // Set encoding options.
    encoder.SetSpeedOptions(5, 5);
    encoder.SetAttributeQuantization(gDracoEncoderModule.POSITION, 10);
    encoder.SetEncodingMethod(gDracoEncoderModule.MESH_EDGEBREAKER_ENCODING);

    // Encoding.
    console.log("Encoding...");
    const encodedLen = encoder.EncodeMeshToDracoBuffer(newMesh,
        encodedData);
    gDracoEncoderModule.destroy(newMesh);

    if (encodedLen > 0) {
        console.log("Encoded size is " + encodedLen);
    } else {
        console.log("Error: Encoding failed.");
    }
    // Copy encoded data to buffer.
    const outputBuffer = new ArrayBuffer(encodedLen);
    const outputData = new Int8Array(outputBuffer);
    for (let i = 0; i < encodedLen; ++i) {
        outputData[i] = encodedData.GetValue(i);
    }
    gDracoEncoderModule.destroy(encodedData);
    gDracoEncoderModule.destroy(encoder);
    gDracoEncoderModule.destroy(meshBuilder);

    console.log(outputBuffer);

    // toLocalFile(outputBuffer, `bunny${Date.now()}.drc`);
}

window.onload = () => {
    const button = document.createElement('button');
    button.style.cssText = `position:absolute;top:20px;right:20px;`;
    button.classList.add('btn', 'btn-primary');
    button.textContent = '导出obj文件'
    button.addEventListener('click', async()=>{
        const meshes = app3.findByName('bunny');
        if (meshes.length > 0) {
            await encodeGeometry(meshes[0].geometry);
        }
    }, false);
    document.body.appendChild(button);
    loadJavaScriptFile('libs/draco/draco_encoder_gltf_nodejs.js', async () => {
        gDracoEncoderModule = await DracoEncoderModule();
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
    console.log('onload', elApp)
    loadModel(drcBunny);
    // loadDracoModule();
}