import { MqMultiViewEditor, alias3, PathLoader, geometry2Mesh, mesh2drc, bindDracoEncoder } from './third/mq-render/viewer.es'
import { loadJavaScriptFile, toLocalFile } from '../../tool/dom'
// import DracoEncoderModule from './assets/draco/draco_encoder_gltf_nodejs';
import drcBunny0 from './assets/bunny.drc?url';
// import drcBunny0 from './assets/bunny.three.drc?url';
import drcBunny1 from './assets/bunny.npm.drc?url';
// import drcBunny1 from './assets/test.cplusplus.drc?url';
// import drcBunny1 from './assets/car.drc?url';
import drcBunny2 from './assets/2.drc?url';
const app3 = new MqMultiViewEditor();
let gDracoEncoderModule: any;
let gDracoDecoderModule: any;
let app:any = {};
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

const attrTypes = { 
    POSITION: 0,
    NORMAL: 1,
    COLOR: 2,
    GENERIC: 4,
}

async function loadModel(path: string) {
    console.log('load modle path ', path)
    const loader = new PathLoader(path, {
        drcPath: 'libs/draco/',
        code: 2,
    });
    const geo = await loader.load(path, function () {
        const e = arguments[0];
        console.log(e);
    });
    console.log('load model geometry', geo);
    const mesh = geometry2Mesh(geo);
    mesh.name = 'bunny';
    mesh.scale.multiplyScalar(100);
    app3.add(mesh);
}

async function decodeGeometry(path: string) {
    const buffer = await fetch(path).then(res => res.arrayBuffer());
    console.log(path, buffer);
    // Decode mesh
    const decoder = new gDracoDecoderModule.Decoder();
    const decodeBuffer = new gDracoDecoderModule.DecoderBuffer();
    decodeBuffer.Init(new Int8Array(buffer), buffer.byteLength);
    const geometryType = decoder.GetEncodedGeometryType(decodeBuffer);
    console.log(path, 'geometry type', geometryType)
    let dracoGeometry:any;    
    let status;
    if (geometryType === gDracoDecoderModule.TRIANGULAR_MESH) {
        dracoGeometry = new gDracoDecoderModule.Mesh();
        status = decoder.DecodeBufferToMesh(decodeBuffer, dracoGeometry);
    } else {
        const errorMsg = `Error: Unknown geometry type ${geometryType}.`;
        console.error(errorMsg);
    }
    gDracoDecoderModule.destroy(decodeBuffer);
    console.log(path, status, status.code(), status.ok())
    console.log(path, dracoGeometry, dracoGeometry.num_attributes());

    // 暂时拿不到这个字段
    // const idFlag = decoder.GetAttributeIdByName(dracoGeometry, 'flag');
    // console.log(path, idFlag);

    Object.keys(attrTypes).forEach(attr=>{        
        console.log(path, attr)
        const id = decoder.GetAttributeId(dracoGeometry, gDracoDecoderModule[attr])
        const attrs = decoder.GetAttribute(dracoGeometry, id);
        const attr_type = attrs.attribute_type();
        console.log(path, attr, id, attrs, attrs.size());
        console.log(attrs.attribute_type(), attrs.data_type(), attrs.byte_stride(), attrs.num_components(), attrs.byte_offset())
        // console.log(attrs.GetAttributeTransformData());
        if (attr_type==4) {            
            const arrDraco = new gDracoDecoderModule.DracoUInt8Array();
            const arrJs = new Uint8Array(attrs.size());
            if (decoder.GetAttributeUInt8ForAllPoints(dracoGeometry, attrs, arrDraco)) {
                for (let i = 0; i < arrDraco.size(); i++) {
                    arrJs[i] = arrDraco.GetValue(i);
                }
                console.log(arrJs);
            }
        } else {
            console.log(attr_type)
            let arrDraco = new gDracoDecoderModule.DracoFloat32Array();
            let arrJs = new Float32Array(attrs.size());
            if (decoder.GetAttributeFloatForAllPoints(dracoGeometry, attrs, arrDraco)) {
                for (let i = 0; i < arrDraco.size(); i++) {
                    arrJs[i] = arrDraco.GetValue(i);
                }
                console.log(arrJs);
            }
        }
    })
}

async function encodeGeometry(geo: any) {
    if (!gDracoEncoderModule) return;
    // console.log(gDracoEncoderModule)
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
    Object.keys(geo.attributes).forEach((attr) => {
        const srcAttribute = geo.attributes[attr];
        let attrType;
        if (attr == 'position') attrType = gDracoEncoderModule['POSITION'];
        else if (attr == 'normal') attrType = gDracoEncoderModule['NORMAL'];
        else if (attr == 'color') attrType = gDracoEncoderModule['COLOR'];
        else if (attr == 'uv') attrType = gDracoEncoderModule['TEX_COORD'];
        else if (attr == 'flag') attrType = gDracoEncoderModule['GENERIC'];
        else throw new Error(`un-support type ${attr}`)
        // console.log(srcAttribute)
        const total = srcAttribute.count * srcAttribute.itemSize;
        // console.log(attr)

        const attributeDataArray = ['flag'].includes(attr) ? new Uint8Array(total) : new Float32Array(total);
        for (let i = 0; i < total; ++i) {
            attributeDataArray[i] = srcAttribute.array.at(i);
        }
        // console.log(attrType, attr, attributeDataArray, srcAttribute)
        meshBuilder.AddFloatAttributeToMesh(newMesh, attrType, srcAttribute.count,
            srcAttribute.itemSize, attributeDataArray);
    });

    let encodedData = new gDracoEncoderModule.DracoInt8Array();
    // Set encoding options.
    encoder.SetSpeedOptions(5, 5);
    encoder.SetAttributeQuantization(gDracoEncoderModule.POSITION, 10);
    encoder.SetEncodingMethod(gDracoEncoderModule.MESH_EDGEBREAKER_ENCODING);

    // Encoding.
    console.log("Encoding...");
    encoder.SetTrackEncodedProperties(true);
    const encodedLen = encoder.EncodeMeshToDracoBuffer(newMesh,
        encodedData);
    gDracoEncoderModule.destroy(newMesh);
    if (encodedLen > 0) {
        console.log("Encoded size is " + encodedLen, encoder.GetNumberOfEncodedPoints(), encoder.GetNumberOfEncodedFaces());
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

    toLocalFile(outputBuffer, `bunny.npm.drc`);
}

window.onload = () => {
    bindDracoEncoder(`libs/draco/draco_encoder.js`);
    // button1
    const button1 = document.createElement('button');
    button1.style.cssText = `position:absolute;top:20px;right:20px;`;
    button1.classList.add('btn', 'btn-primary');
    button1.textContent = 'npm encoder'
    button1.addEventListener('click', async () => {
        const meshes = app3.findByName('bunny');
        if (meshes.length > 0) {
            console.log('npm encode ', meshes[0].geometry)
            await encodeGeometry(meshes[0].geometry);
        }
    }, false);
    document.body.appendChild(button1);
    // button2
    const button2 = document.createElement('button');
    button2.style.cssText = `position:absolute;top:20px;right:150px;`;
    button2.classList.add('btn', 'btn-primary');
    button2.textContent = 'three encoder'
    button2.addEventListener('click', async () => {
        const meshes = app3.findByName('bunny');
        if (meshes.length > 0) {
            const theMesh = meshes[0].clone();
            const geo = theMesh.geometry;
            const attrFlag = new Uint8Array(geo.attributes.position.count);
            for (let i = 0; i < attrFlag.length; i++) {
                attrFlag[i] = Math.random()*10;
            }            
            geo.setAttribute('flag', new alias3.BufferAttribute(attrFlag, 1));
            const buffer = await mesh2drc(theMesh, {exportFlag: true});
            toLocalFile(buffer, `bunny.three.drc`);
        }
    }, false);
    document.body.appendChild(button2);

    loadJavaScriptFile('libs/draco/npm/draco_encoder_gltf_nodejs.js', async () => {
        gDracoEncoderModule = await DracoEncoderModule();
        app.encoderModule = gDracoEncoderModule;
    });
    loadJavaScriptFile('libs/draco/npm/draco_decoder_gltf_nodejs.js', async () => {
        gDracoDecoderModule = await DracoDecoderModule();
        app.decoderModule = gDracoDecoderModule;
        decodeGeometry(drcBunny1);
        // decodeGeometry(drcBunny2);
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
    loadModel(drcBunny0);
}