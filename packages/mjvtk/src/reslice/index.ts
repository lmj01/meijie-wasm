//import '@kitware/vtk.js/favicon';

// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import '@kitware/vtk.js/Rendering/Profiles/All';

import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkAnnotatedCubeActor from '@kitware/vtk.js/Rendering/Core/AnnotatedCubeActor';
import vtkDataArray from '@kitware/vtk.js/Common/Core/DataArray';
import vtkPoints from '@kitware/vtk.js/Common/Core/Points';
import vtkCellArray from '@kitware/vtk.js/Common/Core/CellArray';
import vtkHttpDataSetReader from '@kitware/vtk.js/IO/Core/HttpDataSetReader';
import vtkGenericRenderWindow from '@kitware/vtk.js/Rendering/Misc/GenericRenderWindow';
import vtkImageData from '@kitware/vtk.js/Common/DataModel/ImageData';
import vtkPolyData from '@kitware/vtk.js/Common/DataModel/PolyData';
import vtkPlane from '@kitware/vtk.js/Common/DataModel/Plane';
import vtkLineSource from '@kitware/vtk.js/Filters/Sources/LineSource.js'
import vtkMatrixBuilder from '@kitware/vtk.js/Common/Core/MatrixBuilder';
import vtkPiecewiseFunction from '@kitware/vtk.js/Common/DataModel/PiecewiseFunction'
import vtkImageMapper from '@kitware/vtk.js/Rendering/Core/ImageMapper';
import vtkImageCPRMapper from '@kitware/vtk.js/Rendering/Core/ImageCPRMapper';
import vtkImageReslice from '@kitware/vtk.js/Imaging/Core/ImageReslice';
import vtkImageSlice from '@kitware/vtk.js/Rendering/Core/ImageSlice';
import vtkAxesActor from '@kitware/vtk.js/Rendering/Core/AxesActor';
import vtkVolume from '@kitware/vtk.js/Rendering/Core/Volume';
import vtkVolumeMapper from '@kitware/vtk.js/Rendering/Core/VolumeMapper';
import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction'
import vtkInteractorStyleImage from '@kitware/vtk.js/Interaction/Style/InteractorStyleImage';
import vtkInteractorStyleTrackballCamera from '@kitware/vtk.js/Interaction/Style/InteractorStyleTrackballCamera';
import vtkMath from '@kitware/vtk.js/Common/Core/Math';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkOutlineFilter from '@kitware/vtk.js/Filters/General/OutlineFilter';
import vtkCutter from '@kitware/vtk.js/Filters/Core/Cutter';
import vtkOrientationMarkerWidget from '@kitware/vtk.js/Interaction/Widgets/OrientationMarkerWidget';
import vtkResliceCursorWidget from '@kitware/vtk.js/Widgets/Widgets3D/ResliceCursorWidget';
import vtkWidgetManager from '@kitware/vtk.js/Widgets/Core/WidgetManager';
import vtkCPRManipulator from '@kitware/vtk.js/Widgets/Manipulators/CPRManipulator';

import vtkSphereSource from '@kitware/vtk.js/Filters/Sources/SphereSource';
import { CaptureOn } from '@kitware/vtk.js/Widgets/Core/WidgetManager/Constants';

import { vec3, mat3, mat4 } from 'gl-matrix';
import { SlabMode } from '@kitware/vtk.js/Imaging/Core/ImageReslice/Constants';
import { stlBuffer2Reader, handleGzFile } from '../utils';
import { infoObb, getInfoAxes, vec3ApplyMatrix4 } from '../vtkHelper.js';
import { generateUniformCurve, cross, normalize } from '../mathHelper.js';

import {
    xyzToViewType,
    InteractionMethodsName,
} from '@kitware/vtk.js/Widgets/Widgets3D/ResliceCursorWidget/Constants';
import controlPanel from './controlPanel.html?raw';
//import exCenterline from '../../centerline.ex.json?raw';
import * as nifti from 'nifti-reader-js';

// Force the loading of HttpDataAccessHelper to support gzip decompression
import '@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper';

// ----------------------------------------------------------------------------
// Define main attributes
// ----------------------------------------------------------------------------
//const jsonExCenterline = JSON.parse(exCenterline);
//console.log(jsonExCenterline, typeof(exCenterline));

const viewColors = [
    [1, 0, 0], // sagittal
    [0, 1, 0], // coronal
    [0, 0, 1], // axial
    [0.1, 0.1, 0.5], // sagittal with arch 
    [0.5, 0.5, 0], // 3D 
    [0.5, 0.5, 0.5], // panoramic
    [0.5, 0.1, 0.5], // volume
];

const viewAttributes = [];
window.va = viewAttributes;
const widget = vtkResliceCursorWidget.newInstance();
window.widget = widget;
const widgetState = widget.getWidgetState();
// Set size in CSS pixel space because scaleInPixels defaults to true
widgetState
    .getStatesWithLabel('sphere')
    .forEach((handle) => handle.setScale1(4));
const showDebugActors = true;
const implantList = [];
const gInfo = {
    archPointData: [],
};
window.gInfo = gInfo;
const appCursorStyles = {
    translateCenter: 'move',
    rotateLine: 'alias',
    translateAxis: 'pointer',
    default: 'default',
};

// ----------------------------------------------------------------------------
// Define html structure
// ----------------------------------------------------------------------------
document.body.style='display:flex;flex-wrap:wrap;width:100vw;height:100vh;margin:0;overflow:hidden auto;justify-content:space-evenly;';
const container = document.querySelector('body');
const controlContainer = document.createElement('div');
controlContainer.innerHTML = `${controlPanel}`;
controlContainer.style = 'position:relative;top:0;left:5px;background:lightblue;';
container.appendChild(controlContainer);
const checkboxTranslation = document.getElementById('checkboxTranslation');
const checkboxShowRotation = document.getElementById('checkboxShowRotation');
const checkboxRotation = document.getElementById('checkboxRotation');
const checkboxOrthogonality = document.getElementById('checkboxOrthogonality');

// ----------------------------------------------------------------------------
// Setup rendering code
// ----------------------------------------------------------------------------

function createRGBStringFromRGBValues(rgb) {
    if (rgb.length !== 3) {
        return 'rgb(0, 0, 0)';
    }
    return `rgb(${(rgb[0] * 255).toString()}, ${(rgb[1] * 255).toString()}, ${(
        rgb[2] * 255
    ).toString()})`;
}

const initialPlanesState = { ...widgetState.getPlanes() };

let view3D = null;
let viewPanoramic = null;
let viewVolume = null;
let viewSagittal = null;
for (let i = 0; i < viewColors.length; i++) {
    const elementParent = document.createElement('div');
    elementParent.setAttribute('class', 'view');
    elementParent.style = 'width:300px;height:300px;display:flex;flex-direction:column;margin:20px 0px;';

    const element = document.createElement('div');
    element.setAttribute('class', 'view');
    element.style.width = '100%';
    element.style.height = '100%';
    elementParent.appendChild(element);

    container.appendChild(elementParent);

    const grw = vtkGenericRenderWindow.newInstance();
    grw.setContainer(element);
    grw.resize();
    const obj = {
        renderWindow: grw.getRenderWindow(),
        renderer: grw.getRenderer(),
        GLWindow: grw.getApiSpecificRenderWindow(),
        interactor: grw.getInteractor(),
        widgetManager: vtkWidgetManager.newInstance(),
        orientationWidget: null,
    };

    obj.renderer.getActiveCamera().setParallelProjection(true);
    obj.renderer.setBackground(...viewColors[i]);
    obj.renderWindow.addRenderer(obj.renderer);
    obj.renderWindow.addView(obj.GLWindow);
    obj.renderWindow.setInteractor(obj.interactor);
    obj.interactor.setView(obj.GLWindow);
    obj.interactor.initialize();
    obj.interactor.bindEvents(element);
    obj.widgetManager.setRenderer(obj.renderer);
    if (i < 3) {

        obj.interactor.setInteractorStyle(vtkInteractorStyleImage.newInstance());
        obj.widgetInstance = obj.widgetManager.addWidget(widget, xyzToViewType[i]);
        obj.widgetInstance.setScaleInPixels(true);
        //obj.widgetInstance.setHoleWidth(50);
        obj.widgetInstance.setInfiniteLine(false);
        widgetState
            .getStatesWithLabel('line')
            // 线宽和长度
            //.forEach((state) => state.setScale3(4, 4, 300));
            .forEach((state) => state.setScale3(1, 1, 100));
        widgetState
            .getStatesWithLabel('center')
            //.forEach((state) => state.setOpacity(128));
            .forEach((state) => state.setOpacity(218));
        //obj.widgetInstance.setKeepOrthogonality(checkboxOrthogonality.checked);
        obj.widgetInstance.setCursorStyles(appCursorStyles);
        obj.widgetManager.enablePicking();
        // Use to update all renderers buffer when actors are moved
        obj.widgetManager.setCaptureOn(CaptureOn.MOUSE_MOVE);
    } else if (i == 3) {
        obj.interactor.setInteractorStyle(vtkInteractorStyleImage.newInstance());
    } else {
        obj.interactor.setInteractorStyle(
            vtkInteractorStyleTrackballCamera.newInstance()
        );
    }

    obj.reslice = vtkImageReslice.newInstance();
    obj.reslice.setSlabMode(SlabMode.MEAN);
    obj.reslice.setSlabNumberOfSlices(1);
    obj.reslice.setTransformInputSampling(false);
    //obj.reslice.setAutoCropOutput(true);
    obj.reslice.setOutputDimensionality(2);
    obj.resliceMapper = vtkImageMapper.newInstance();
    obj.resliceMapper.setInputConnection(obj.reslice.getOutputPort());
    obj.resliceActor = vtkImageSlice.newInstance();
    obj.resliceActor.setMapper(obj.resliceMapper);
    obj.sphereActors = [];
    obj.sphereSources = [];

    // Create sphere for each 2D views which will be displayed in 3D
    // Define origin, point1 and point2 of the plane used to reslice the volume
    if (![4,5,6].includes(i)) {
        for (let j = 0; j < 3; j++) {
            const sphere = vtkSphereSource.newInstance();
            // 辅组球体的半径
            sphere.setRadius(3);
            const mapper = vtkMapper.newInstance();
            mapper.setInputConnection(sphere.getOutputPort());
            const actor = vtkActor.newInstance();
            actor.setMapper(mapper);
            actor.getProperty().setColor(...viewColors[i]);
            actor.setVisibility(showDebugActors);
            obj.sphereActors.push(actor);
            obj.sphereSources.push(sphere);
        }
    }

    if (i < 3) {
        viewAttributes.push(obj);
    } else if (i == 3) {
        viewSagittal = obj;
        window.viewerSagittal = obj;
        viewSagittal.reslice.setAutoCropOutput(true);
    } else if (i == 5) {
        viewPanoramic = obj;
        window.viewerPanoramic = obj;
        continue;
    } else if (i == 6) {
        viewVolume = obj;
        window.viewerVolume = obj;
        continue;
    } else {
        view3D = obj;
        window.v3d = obj;
    }

    if (false) {
        // create axes
        const axes = vtkAnnotatedCubeActor.newInstance();
        axes.setDefaultStyle({
            text: '+X',
            //fontStyle: 'bold',
            fontFamily: 'Arial',
            fontColor: 'black',
            fontSizeScale: (res) => res / 5,
            faceColor: createRGBStringFromRGBValues(viewColors[0]),
            faceRotation: 0,
            edgeThickness: 0.1,
            dgeColor: 'black',
            resolution: 100,
        });
        // axes.setXPlusFaceProperty({ text: '+X' });
        axes.setXMinusFaceProperty({
            text: '-X',
            faceColor: createRGBStringFromRGBValues(viewColors[0]),
            faceRotation: 90,
            fontStyle: 'italic',
        });
        axes.setYPlusFaceProperty({
            text: '+Y',
            faceColor: createRGBStringFromRGBValues(viewColors[1]),
            fontSizeScale: (res) => res / 4,
        });
        axes.setYMinusFaceProperty({
            text: '-Y',
            faceColor: createRGBStringFromRGBValues(viewColors[1]),
            fontColor: 'white',
        });
        axes.setZPlusFaceProperty({
            text: '+Z',
            faceColor: createRGBStringFromRGBValues(viewColors[2]),
        });
        axes.setZMinusFaceProperty({
            text: '-Z',
            faceColor: createRGBStringFromRGBValues(viewColors[2]),
            faceRotation: 45,
        });
    

        // create orientation widget
        obj.orientationWidget = vtkOrientationMarkerWidget.newInstance({
            actor: axes,
            interactor: obj.renderWindow.getInteractor(),
        });
    
        obj.orientationWidget.setEnabled(true);
        obj.orientationWidget.setViewportCorner(
            vtkOrientationMarkerWidget.Corners.BOTTOM_RIGHT
        );
        obj.orientationWidget.setViewportSize(0.15);
        obj.orientationWidget.setMinPixelSize(50);
        obj.orientationWidget.setMaxPixelSize(80);
    }

    // create sliders
    if (i < 3) {
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = 0;
        slider.max = 200;
        slider.style.bottom = '0px';
        slider.style.width = '100%';
        elementParent.appendChild(slider);
        obj.slider = slider;

        slider.addEventListener('change', (ev) => {
            const newDistanceToP1 = ev.target.value;
            const dirProj = widget.getWidgetState().getPlanes()[xyzToViewType[i]].normal;
            const planeExtremities = widget.getPlaneExtremities(xyzToViewType[i]);
            console.log('slider', planeExtremities);
            const newCenter = vtkMath.multiplyAccumulate(
                planeExtremities[0],
                dirProj,
                Number(newDistanceToP1),
                []
            );
            console.log(newCenter);
            widget.setCenter(newCenter);
            obj.widgetInstance.invokeInteractionEvent(
                obj.widgetInstance.getActiveInteraction()
            );
            viewAttributes.forEach((obj2) => {
                obj2.interactor.render();
            });
            updateCutter(i);
            fullViewerForWidget(obj);
        });
    } else if (i == 3) {
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = 0;
        slider.max = 200;
        slider.style.bottom = '0px';
        slider.style.width = '100%';
        elementParent.appendChild(slider);
        obj.slider = slider;

        slider.addEventListener('input', (ev) => {
            updateArchSagittal(Number(ev.target.value));
        });
    }
}
if (true) {
    viewSagittal.renderer.addActor(viewSagittal.resliceActor);
    //view3D.renderer.addActor(viewSagittal.resliceActor);
    //viewVolume.renderer.addActor(viewSagittal.resliceActor);
    //viewPanoramic.renderer.addActor(viewSagittal.resliceActor);
    viewSagittal.reslice.setOutputDimensionality(2);
    //viewSagittal.reslice.setOutputScalarType('Uint16Array');
    //viewSagittal.reslice.setScalarScale(65535 / 255);
    //
    //const axes = mat4.create();
    //mat4.rotateX(axes, axes, 45 * Math.PI/ 180);
    //viewSagittal.reslice.setResliceAxes(axes);

    gInfo.axes = vtkAxesActor.newInstance();
    const scaleFactor = 90;
    gInfo.axes.setScale(scaleFactor, scaleFactor, scaleFactor);
    viewVolume.renderer.addActor(gInfo.axes);
    viewPanoramic.renderer.addActor(gInfo.axes);
    view3D.renderer.addActor(gInfo.axes);
}
function addSagittalNormalAndTangent() {
    // 创建切线边框（蓝色）
    const tangentLineSource = vtkLineSource.newInstance()
    const tangentMapper = vtkMapper.newInstance()
    tangentMapper.setInputConnection(tangentLineSource.getOutputPort())
    gInfo.sagittalTangent = vtkActor.newInstance()
    gInfo.sagittalTangent.setMapper(tangentMapper)
    gInfo.sagittalTangent.getProperty().setColor(0, 0, 1) // 蓝色
    gInfo.sagittalTangent.getProperty().setLineWidth(1)
    gInfo.sagittalTangent.getProperty().setOpacity(0.8)
    
    // 创建法线边框（黄色）
    const normalLineSource = vtkLineSource.newInstance()
    const normalMapper = vtkMapper.newInstance()
    normalMapper.setInputConnection(normalLineSource.getOutputPort())
    gInfo.sagittalNormal = vtkActor.newInstance()
    gInfo.sagittalNormal.setMapper(normalMapper)
    gInfo.sagittalNormal.getProperty().setColor(1, 1, 0) // 黄色
    gInfo.sagittalNormal.getProperty().setLineWidth(1)
    gInfo.sagittalNormal.getProperty().setOpacity(0.8)
    
    gInfo.sagittalTangentLineSource = tangentLineSource; 
    gInfo.sagittalNormalLineSource = normalLineSource;
    viewAttributes[2].renderer.addActor(gInfo.sagittalTangent);
    viewAttributes[2].renderer.addActor(gInfo.sagittalNormal);

    view3D.renderer.addActor(gInfo.sagittalTangent);
    view3D.renderer.addActor(gInfo.sagittalNormal);

    viewSagittal.reslice.setOutputExtent(0, gInfo.dims[0]-1, 0, gInfo.dims[1]-1, 0, gInfo.dims[2]-1);
    const defaultIndex = Math.ceil(gInfo.sliderMax / 2);
    updateArchSagittal(defaultIndex);
    viewSagittal.slider.max = gInfo.sliderMax;
    viewSagittal.slider.value = defaultIndex;
    
    viewSagittal.GLWindow.getCanvas().addEventListener('wheel', (e)=>{
        const delta = e.deltaY > 0 ? -1 : 1
        const nowSlice = Number(viewSagittal.slider.value);
        const newSlice = Math.max(0, Math.min(gInfo.sliderMax - 1, nowSlice + delta));
        viewSagittal.slider.value = newSlice;
        updateArchSagittal(newSlice);
    });
}
function fullViewerForWidget(viewer) {
    const { GLWindow, resliceActor, renderer, renderWindow } = viewer;
    const canvas = GLWindow.getCanvas();
    const imageData = resliceActor.getMapper().getInputData();
    const [xMin, xMax, yMin, yMax, zMin, zMax] = imageData.getExtent();
    const [sx, sy, sz] = imageData.getSpacing();
    const [ox, oy, oz] = imageData.getOrigin();
    const width  = (xMax - xMin + 1) * sx;
    const height = (yMax - yMin + 1) * sy;
    const camera = renderer.getActiveCamera();
    const aspect = canvas.width / canvas.height;
    if (aspect > width / height) {
        camera.setParallelScale(height / 2);
    } else {
        camera.setParallelScale(width / 2 / aspect);
    }
    renderer.resetCameraClippingRange();
    renderWindow.render();
}
function fitFullViewer(viewer) {
    const { GLWindow, resliceActor, renderer, renderWindow } = viewer;
    const canvas = GLWindow.getCanvas();
    const imageData = resliceActor.getMapper().getInputData();
    const [xMin, xMax, yMin, yMax, zMin, zMax] = imageData.getExtent();
    const [sx, sy, sz] = imageData.getSpacing();
    const [ox, oy, oz] = imageData.getOrigin();
    const width  = (xMax - xMin + 1) * sx;
    const height = (yMax - yMin + 1) * sy;
    // image center 
    const centerX = ox + (xMax - xMin) * sx / 2;
    const centerY = oy + (yMax - yMin) * sy / 2;
    const centerZ = oz + (zMax - zMin) * sz / 2;

    const camera = renderer.getActiveCamera();
    camera.setParallelProjection(true);
    camera.setFocalPoint(centerX, centerY, centerZ);
    camera.setPosition(centerX, centerY, centerZ + 1);
    camera.setViewUp(0, 1, 0);

    const aspect = canvas.width / canvas.height;
    if (aspect > width / height) {
        camera.setParallelScale(height / 2);
    } else {
        camera.setParallelScale(width / 2 / aspect);
    }

    // 不能同时设置两个
    //renderer.resetCamera();
    renderer.resetCameraClippingRange();
    renderWindow.render();
}
function updateArchSagittal(index) {
    const { reslice, resliceActor } = viewSagittal;
    const { currentPoint, tangent, normalDirection, verticalDirection, mat } = getTangentAndNormal(index, true);
    const matZ = viewAttributes[2].resliceActor.getUserMatrix();
    const imat = mat4.create();
    mat4.copy(imat, matZ);
    imat[12] = 0;
    imat[13] = 0;
    imat[14] = 0;

    const borderLength = 50;
    // 更新切线边框（蓝色）- 沿着切线方向
    const tangentStart = [
        currentPoint[0] - tangent[0] * borderLength / 2,
        currentPoint[1] - tangent[1] * borderLength / 2,
        currentPoint[2] - tangent[2] * borderLength / 2
    ]
    const tangentEnd = [
        currentPoint[0] + tangent[0] * borderLength / 2,
        currentPoint[1] + tangent[1] * borderLength / 2,
        currentPoint[2] + tangent[2] * borderLength / 2
    ]
    
    gInfo.sagittalTangentLineSource.setPoint1(tangentStart)
    gInfo.sagittalTangentLineSource.setPoint2(tangentEnd)
    gInfo.sagittalTangentLineSource.modified()

    // 更新法线边框（黄色）- 沿着法线方向
    const normalStart = [
        currentPoint[0] - normalDirection[0] * borderLength / 2,
        currentPoint[1] - normalDirection[1] * borderLength / 2,
        currentPoint[2] - normalDirection[2] * borderLength / 2
    ]
    const normalEnd = [
        currentPoint[0] + normalDirection[0] * borderLength / 2,
        currentPoint[1] + normalDirection[1] * borderLength / 2,
        currentPoint[2] + normalDirection[2] * borderLength / 2
    ]
    
    gInfo.sagittalNormalLineSource.setPoint1(normalStart)
    gInfo.sagittalNormalLineSource.setPoint2(normalEnd)
    gInfo.sagittalNormalLineSource.modified();

    const origin = [
        (normalStart[0] + normalEnd[0]) / 2,
        (normalStart[1] + normalEnd[1]) / 2,
        (normalStart[2] + normalEnd[2]) / 2
    ];
    const zAxis = tangent;
    const xAxis = vec3.create();
    const yAxis = vec3.create();
    vec3.cross(xAxis, zAxis, [0, 0, 1]);
    if (vec3.length(xAxis) < 1e-6) {
        console.warn('z Axis is close to parallel');
        vec3.cross(xAxis, zAxis, [0, 1, 0]);
    }
    vec3.normalize(xAxis, xAxis);
    vec3.cross(yAxis, zAxis, xAxis);
    vec3.normalize(yAxis, yAxis);
    const m = mat4.create();
    mat4.set(m, ...xAxis, 0, ...yAxis, 0, ...zAxis, 0, 0,0,0,1);
    m[12] = currentPoint[0];
    m[13] = currentPoint[1];
    m[14] = currentPoint[2];
    mat4.multiply(m, m, imat);
    //mat4.multiply(m, imat, m);
    viewSagittal.reslice.setResliceAxes(m);
    //viewSagittal.resliceActor.setUserMatrix(m);
    
    viewAttributes[2].renderWindow.render();
    view3D.renderWindow.render();
    viewVolume.renderWindow.render();
    viewPanoramic.renderWindow.render();
    fitFullViewer(viewSagittal);
    fullViewerForWidget(viewAttributes[2]);
}
function getTangentAndNormal(index, lastIndexReverse = false) {
    console.log('arch index', index);
    const { archPointData } = gInfo;
    const totalNumber = archPointData.length;

    const matZ = viewAttributes[2].resliceActor.getUserMatrix()
    const t = index / (totalNumber - 1) // t是0到1之间的插值系数，表示在牙弓曲线上的相对位置
    let index1, index2, alpha

    if (index === totalNumber - 1 && lastIndexReverse) {
        // 最后一个切片，使用倒数第二个和最后一个点
        index1 = totalNumber - 2
        index2 = totalNumber - 1
        alpha = 1.0
    } else {
        const curveIndex = t * (totalNumber - 1 - 1) // 将t映射到曲线点数组的索引范围内
        // 获取左侧插值点的索引，使用floor向下取整，确保不超出数组范围
        index1 = Math.min(Math.floor(curveIndex), totalNumber - 1)
        // 获取右侧插值点的索引，确保不超出数组范围
        index2 = Math.min(index1 + 1, totalNumber - 1)
        alpha = curveIndex - index1 // 计算两点之间的精确插值系数
    }
    // 插值计算当前点
    const rawCurrentPoint = [
        archPointData[index1][0] * (1 - alpha) + archPointData[index2][0] * alpha,
        archPointData[index1][1] * (1 - alpha) + archPointData[index2][1] * alpha,
        archPointData[index1][2] * (1 - alpha) + archPointData[index2][2] * alpha,
        1.0
    ]
    
    // 应用变换
    const transformedCurrentPoint = vec3ApplyMatrix4(rawCurrentPoint, matZ);
    const currentPoint = [
        transformedCurrentPoint[0],
        transformedCurrentPoint[1],
        transformedCurrentPoint[2]
    ]
    
    // 计算切线方向
    const rawTangent = [
        archPointData[index1][0] - archPointData[index2][0],
        archPointData[index1][1] - archPointData[index2][1],
        archPointData[index1][2] - archPointData[index2][2],
        0.0
    ]
    
    // 变换并归一化切线
    const transformedTangent = vec3ApplyMatrix4(rawTangent, matZ);
    const tangent = normalize([
        transformedTangent[0],
        transformedTangent[1],
        transformedTangent[2]
    ])
    
    // // 计算法向和垂直方向
    const rawUpVector = [0, 0, 1, 0]
    const transformedUpVector = vec3ApplyMatrix4([0,0,1], matZ);
    const upVector = normalize([
        transformedUpVector[0],
        transformedUpVector[1],
        transformedUpVector[2]
    ])
    
    // 计算法向量（垂直于切线和上方向）
    let normalDirection = cross(tangent, upVector)
    normalDirection = normalize(normalDirection)
    //normalDirection = normalDirection.map(item => item * -1)
    // 计算垂直方向（垂直于切线和法向）
    let verticalDirection = cross(normalDirection, tangent)
    verticalDirection = normalize(verticalDirection)
    const mat = mat4.create();
    //mat4.set(mat, ...tangent, 0, ...verticalDirection, 0, ...normalDirection, 0, 0,0,0,1);
    mat4.set(mat, ...tangent, 0, ...normalDirection, 0, ...verticalDirection, 0, 0,0,0,1);
    return { currentPoint, rawTangent, tangent, normalDirection, verticalDirection, mat }
}
function getVolumeCenter(index) {
    const slider = viewAttributes[index].slider;
    const dirProj = widget.getWidgetState().getPlanes()[xyzToViewType[index]].normal;
    const planeExtremities = widget.getPlaneExtremities(xyzToViewType[index]);
    const newCenter = vtkMath.multiplyAccumulate(
        planeExtremities[0],
        dirProj,
        Number(slider.value),
        []
    );
    return newCenter;
}
function updateCutter(index) {
   
}
// ----------------------------------------------------------------------------
// Load image
// ----------------------------------------------------------------------------

function updateReslice(
    interactionContext = {
        viewType: '',
        reslice: null,
        actor: null,
        renderer: null,
        resetFocalPoint: false, // Reset the focal point to the center of the display image
        computeFocalPointOffset: false, // Defines if the display offset between reslice center and focal point has to be
        // computed. If so, then this offset will be used to keep the focal point position during rotation.
        spheres: null,
        slider: null,
    }
) {
    const modified = widget.updateReslicePlane(
        interactionContext.reslice,
        interactionContext.viewType
    );
    if (modified) {
        const resliceAxes = interactionContext.reslice.getResliceAxes();
        // Get returned modified from setter to know if we have to render
        interactionContext.actor.setUserMatrix(resliceAxes);
        const planeSource = widget.getPlaneSource(interactionContext.viewType);
        interactionContext.sphereSources[0].setCenter(planeSource.getOrigin());
        interactionContext.sphereSources[1].setCenter(planeSource.getPoint1());
        interactionContext.sphereSources[2].setCenter(planeSource.getPoint2());

        if (interactionContext.slider) {
            const planeExtremities = widget.getPlaneExtremities(
                interactionContext.viewType
            );
            const length = Math.sqrt(
                vtkMath.distance2BetweenPoints(planeExtremities[0], planeExtremities[1])
            );
            const dist = Math.sqrt(
                vtkMath.distance2BetweenPoints(
                    planeExtremities[0],
                    widgetState.getCenter()
                )
            );
            interactionContext.slider.min = 0;
            interactionContext.slider.max = length;
            interactionContext.slider.value = dist;
            interactionContext.slider.title = `${parseInt(dist)}`;
        }
        updateCutter(interactionContext.viewType - 4);
    }
    widget.updateCameraPoints(
        interactionContext.renderer,
        interactionContext.viewType,
        interactionContext.resetFocalPoint,
        interactionContext.computeFocalPointOffset
    );
    view3D.renderWindow.render();
    if (modified) {
        // create a rotateed basic data array to orientaed the CPR 
        centerline.getPointData().setTensors(
            vtkDataArray.newInstance({
                name: 'Orientation',
                numberOfComponents: 16, 
                values: Float32Array.from(va[0].resliceActor.getMatrix())
            })
        );
        centerline.modified();
    }
    return modified;
}

const centerline = vtkPolyData.newInstance();
const cprActor = vtkImageSlice.newInstance();
const cprMapper = vtkImageCPRMapper.newInstance();
cprMapper.setBackgroundColor(0, 0, 0, 0);
cprActor.setMapper(cprMapper);
cprMapper.setWidth(400);
const cprManipulator = vtkCPRManipulator.newInstance({
    cprActor,
});

// set positions of the cuenterline (model coordinates)
function setCenterlineData(centerPoints:Float32Array) {
    const nPoints = centerPoints.length / 3;
    centerline.getPoints().setData(centerPoints, 3);
    // set polylines of the centerline
    const lines = new Uint16Array(1 + nPoints);
    lines[0] = nPoints;
    for (let i = 0; i < nPoints.length; i++) {
        lines[i + 1] = i;
    }
    centerline.getLines().setData(lines);

    // create a rotateed basic data array to orientaed the CPR 
    centerline.getPointData().setTensors(
        vtkDataArray.newInstance({
            name: 'Orientation',
            numberOfComponents: 16, 
            values: Float32Array.from(va[0].resliceActor.getMatrix())
        })
    );
    centerline.modified();

    const midPointDistance = cprMapper.getHeight() / 2;
    const { worldCoords } = cprManipulator.distanceEvent(midPointDistance);
    widget.setManipulator(cprManipulator);
    viewPanoramic.renderWindow.render();
}
function qformToMatrix(hdr) {
    const b = hdr.quatern_b;
    const c = hdr.quatern_c;
    const d = hdr.quatern_d;
    const a = Math.sqrt(1 - (b*b + c*c + d*d));

    const dx = hdr.pixDims[1];
    const dy = hdr.pixDims[2];
    const dz = hdr.pixDims[3];

    const R = mat4.create();
    R[0] = a*a + b*b - c*c - d*d;
    R[1] = 2*(b*c - a*d);
    R[2] = 2*(b*d + a*c);

    R[4] = 2*(b*c + a*d);
    R[5] = a*a - b*b + c*c - d*d;
    R[6] = 2*(c*d - a*b);

    R[8] = 2*(b*d - a*c);
    R[9] = 2*(c*d + a*b);
    R[10] = a*a - b*b - c*c + d*d;
    R[15] = 1.0;

    const M = mat4.create();
    mat4.multiply(M, R, M);
    mat4.translate(M, M, [hdr.qoffset_x, hdr.qoffset_y, hdr.qoffset_z]);
    return M;
}
function parseNiiData(data:ArrayBuffer) {
    const isNifti = nifti.isNIFTI(data);
    if (!isNifti) {
        console.error('is not nii data');
        return;
    }
    console.log('isCompressed', nifti.isCompressed(data))
    console.log('isNIFTI1', nifti.isNIFTI1(data))
    console.log('isNIFTI2', nifti.isNIFTI2(data))
    const meta = {};
    meta.header = nifti.readHeader(data);
    const niiImage = nifti.readImage(meta.header, data);
    window.niiImg = niiImage;
    if (nifti.hasExtension(meta.header)) {
        const niftiExt = nifti.readExtensionData(meta.header, data);
        console.log('nii ext', niftiExt);
    }
    meta.dims = meta.header.dims.slice(1,4);
    meta.spacing = meta.header.pixDims.slice(1,4);
    meta.origin = [
        meta.header.qoffset_x || 0,
        meta.header.qoffset_y || 0,
        meta.header.qoffset_z || 0
    ];
    console.log(meta, niiImage);
    

    let M = mat4.create();
    // sform 
    if (meta.header.sform_code > 0) {
        console.log('use sform', meta.header.sform_code);
        for (let i = 0; i < 16; i++) M[Math.floor(i/4)*4 + i % 4] = meta.header.affine[i];
    } else if (meta.header.qform_code > 0) {
        console.log('use qform', meta.header.qform_code);
        M = qformToMatrix(meta.header);
    } else {
        console.log('use default');
        mat4.scale(M, M, meta.spacing);
        mat4.translate(M, M, [meta.header.qoffset_x, meta.header.qoffset_y, meta.header.qoffset_z]);
    }

    const dir = new Float32Array(9);
    for (let i = 0; i < 3; i++) { 
        for (let j = 0; j < 3; j++) { 
            dir[i * 3 + j] = M[i * 4 + j];
        }
    }
    const origin = [M[12],M[13],M[14]];
    console.log(M, dir, origin);

    let scalarArray;
    switch(meta.header.datatypeCode) {
        case nifti.NIFTI1.TYPE_INT16:
            console.log('Int16Array');
            scalarArray = new Int16Array(niiImage);
            break;
        case nifti.NIFTI1.TYPE_INT32:
            console.log('Int32Array');
            scalarArray = new Int32Array(niiImage);
            break;
        case nifti.NIFTI1.TYPE_FLOAT32:
            console.log('Float32Array');
            scalarArray = new Float32Array(niiImage);
            break;
        case nifti.NIFTI1.TYPE_UINT8:
            console.log('Uint8Array');
            scalarArray = new Uint8Array(niiImage);
            break;
        default:
            console.warn('no support handle type, try UInt16Array', dataType);
            scalarArray = new UInt16Array(data);
    }

    const scalars = vtkDataArray.newInstance({
        name:'Scalars',
        values: scalarArray,
        numberOfComponents: 1,
    });
    const imageData = vtkImageData.newInstance();
    imageData.setDimensions(...meta.dims);
    imageData.setSpacing(...meta.spacing);
    imageData.setOrigin(...meta.origin);
    imageData.setDirection(dir);
    imageData.getPointData().setScalars(scalars);
    
    return imageData;
}
const mapData = {
    615: {
        //nii: './615.nii.gz',
        nii: './615a.nii.gz',
        //nii: './CBCT_org.nii.gz',
        asc: './archcurve615.asc',
    },
    test: {
        nii: './CBCT_org.nii',
        asc: 'archcurve.asc',
    },
    ct2: {
        nii: './ct2.nii.gz',
        asc: 'archcurvect2.asc',
    },
}
const idxMap = '615';
if (false) {
    new Promise(async(resolve)=>{
        const url = mapData[idxMap].nii;
        if (url.endsWith('nii.gz')) {
            const buffer = await fetch(url).then(res=>res.arrayBuffer());
            resolve(handleGzFile(buffer));
        } else {
            resolve(url);
        }
    }).then(async (bufferOrUrl) =>{
        let data = null;
        if (bufferOrUrl instanceof ArrayBuffer) {
            data = bufferOrUrl;
        } else if (typeof(bufferOrUrl) == 'string') {
            data = await fetch(bufferOrUrl).then(res=>res.arrayBuffer());
        }
        if (!data) {
            console.error('not load nii data');
            return;
        } else {
            handleNiiData(data);
        }
            
        const archcurve = await fetch(mapData[idxMap].asc).then(res=>res.text());
        const inPoints = archcurve.split('\n').filter(e=>e).map(e=>e.split(' ').map(e=>parseFloat(e)));
        let archPointData = [];
        let idx = 0;
        inPoints.forEach((pt)=>{
            archPointData.push([pt[0], pt[1], pt[2]]);
        });
        archPointData = generateUniformCurve(archPointData, 800);
        handleArchData(archPointData);
    });
}
function handleArchData(data) {
    gInfo.archPointData = data;
    viewSagittal.slider.max = data.length;
    gInfo.sliderMax = data.length;
    addSagittalNormalAndTangent();

    // 创建线条几何体
    const points = vtkPoints.newInstance()
    const lines = vtkCellArray.newInstance()
    // 添加曲线点
    data.forEach((pt, index) => {
        points.insertNextPoint(pt[0], pt[1], pt[2]);
        if (index > 0) {
            lines.insertNextCell([index - 1, index])
        }
    })
    // 创建polyData
    const polyData = vtkPolyData.newInstance()
    polyData.setPoints(points)
    polyData.setLines(lines)
    // 创建映射器和actor
    const mapper = vtkMapper.newInstance()
    mapper.setInputData(polyData)

    const actorArch = vtkActor.newInstance()
    actorArch.setMapper(mapper)
    actorArch.getProperty().setColor(1, 1, 0) // 黄色，便于观察
    actorArch.getProperty().setLineWidth(3);
    actorArch.setUserMatrix(viewAttributes[2].resliceActor.getUserMatrix());
    viewAttributes[2].renderer.addActor(actorArch);
    viewAttributes[2].renderWindow.render();
    //viewSagittal.renderer.addActor(actorArch);
    //viewSagittal.renderWindow.render();
    viewVolume.renderer.addActor(actorArch);
    viewVolume.renderWindow.render();
    //view3D.renderer.addActor(actorArch);
    //view3D.renderWindow.render();
}
function addVolumeData(image) {
    // add 3d 
    const actor3d = vtkVolume.newInstance();
    const actor3dMapper = vtkVolumeMapper.newInstance();
    actor3dMapper.setInputData(image);
    actor3dMapper.setSampleDistance(0.9);
    actor3dMapper.setAutoAdjustSampleDistances(false) // 禁用自动调整采样距离
    actor3dMapper.setVolumetricScatteringBlending(0.1) // 设置体积散射混合（注释掉）
    //actor3dMapper.setBlendMode(0) // 设置混合模式（注释掉）
    actor3dMapper.setIpScalarRange(0.0, 1.0) // 设置IP标量范围（注释掉）
    actor3d.setMapper(actor3dMapper);
    // 将灰度值范围改为1000-3000
    const ctfun = vtkColorTransferFunction.newInstance() // 创建颜色传递函数，用于定义体数据的颜色映射
    ctfun.addRGBPoint(200.0, 0.4, 0.5, 0.0) // 在值200处添加RGB颜色点(0.4,0.5,0.0)，即黄绿色
    ctfun.addRGBPoint(2500.0, 1.0, 1.0, 1.0) // 在值2000处添加RGB颜色点(1.0,1.0,1.0)，即白色
    const ofun = vtkPiecewiseFunction.newInstance() // 创建分段函数，用于定义体数据的不透明度映射
    ofun.addPoint(0.0, 0.0) // 在值0处设置不透明度为0.0，即完全透明
    ofun.addPoint(255.0, 1.0) // 在值255处设置不透明度为1.0，即完全不透明
    actor3d.getProperty().setRGBTransferFunction(0, ctfun) // 将颜色传递函数设置到actor的第0个属性
    actor3d.getProperty().setScalarOpacity(0, ofun) // 将不透明度函数设置到actor的第0个属性
    actor3d.getProperty().setScalarOpacityUnitDistance(0, 1) // 设置标量不透明度单位距离为1，控制不透明度的衰减
    actor3d.getProperty().setInterpolationTypeToLinear() // 设置插值类型为线性插值，使渲染更平滑
    actor3d.getProperty().setUseGradientOpacity(0, true) // 启用梯度不透明度，基于数据梯度调整不透明度
    actor3d.getProperty().setGradientOpacityMinimumValue(0, 15) // 设置梯度不透明度最小值为15
    actor3d.getProperty().setGradientOpacityMinimumOpacity(0, 0.0) // 设置梯度不透明度最小不透明度为0.0
    actor3d.getProperty().setGradientOpacityMaximumValue(0, 100) // 设置梯度不透明度最大值为100
    actor3d.getProperty().setGradientOpacityMaximumOpacity(0, 1.0) // 设置梯度不透明度最大不透明度为1.0
    actor3d.getProperty().setShade(true) // 启用阴影效果，使3D渲染更有立体感
    actor3d.getProperty().setAmbient(0.5) // 设置环境光系数为0.5，控制整体亮度
    actor3d.getProperty().setDiffuse(0.5) // 设置漫反射系数为0.5，控制表面反射强度
    actor3d.getProperty().setSpecular(0.5) // 设置镜面反射系数为0.5，控制高光效果
    actor3d.getProperty().setSpecularPower(8.0) // 设置镜面反射功率为8.0，控制高光的锐度
    viewVolume.renderer.addVolume(actor3d);
}
function handleNiiData(data:ArrayBuffer) {
    const image = parseNiiData(data); 
    console.log(image);
    gInfo.dims = image.getDimensions();
    gInfo.spacing = image.getSpacing();
    viewSagittal.reslice.setInputData(image);
    widget.setImage(image);
   
    addVolumeData(image);
    getInfoAxes().forEach(v=>{ 
        viewVolume.renderer.addActor(v.actor);
        viewPanoramic.renderer.addActor(v.actor);
    });
    viewVolume.renderer.resetCamera();
    viewVolume.renderWindow.render();
    viewPanoramic.renderer.resetCamera();
    viewPanoramic.renderWindow.render();


    // Create image outline in 3D view
    const outline = vtkOutlineFilter.newInstance();
    outline.setInputData(image);
    const outlineMapper = vtkMapper.newInstance();
    outlineMapper.setInputData(outline.getOutputData());
    const outlineActor = vtkActor.newInstance();
    outlineActor.setMapper(outlineMapper);
    view3D.renderer.addActor(outlineActor);

    viewAttributes.forEach((obj, i) => {
        obj.reslice.setInputData(image);
        obj.renderer.addActor(obj.resliceActor);
        if (i == 31) {
        } else {
            view3D.renderer.addActor(obj.resliceActor);
        }
        obj.sphereActors.forEach((actor) => {
            obj.renderer.addActor(actor);
            view3D.renderer.addActor(actor);
        });
        const reslice = obj.reslice;
        const viewType = xyzToViewType[i];

        viewAttributes
        // No need to update plane nor refresh when interaction
        // is on current view. Plane can't be changed with interaction on current
        // view. Refreshs happen automatically with `animation`.
        // Note: Need to refresh also the current view because of adding the mouse wheel
        // to change slicer
        .forEach((v) => {
            // Store the FocalPoint offset before "interacting".
            // The offset may have been changed externally when manipulating the camera
            // or interactorstyle.
            v.widgetInstance.onStartInteractionEvent(() => {
                updateReslice({
                    viewType,
                    reslice,
                    actor: obj.resliceActor,
                    renderer: obj.renderer,
                    resetFocalPoint: false,
                    computeFocalPointOffset: true,
                    sphereSources: obj.sphereSources,
                    slider: obj.slider,
                });
                fullViewerForWidget(v);
            });

            // Interactions in other views may change current plane
            v.widgetInstance.onInteractionEvent(
            // canUpdateFocalPoint: Boolean which defines if the focal point can be updated because
            // the current interaction is a rotation
                (interactionMethodName) => {
                    const canUpdateFocalPoint =
                    interactionMethodName === InteractionMethodsName.RotateLine;
                    const activeViewType = widget
                        .getWidgetState()
                        .getActiveViewType();
                    const computeFocalPointOffset =
                        activeViewType === viewType || !canUpdateFocalPoint;
                    updateReslice({
                        viewType,
                        reslice,
                        actor: obj.resliceActor,
                        renderer: obj.renderer,
                        resetFocalPoint: false,
                        computeFocalPointOffset,
                        sphereSources: obj.sphereSources,
                        slider: obj.slider,
                    });
                    fullViewerForWidget(v);
                }
            );
        });

        updateReslice({
            viewType,
            reslice,
            actor: obj.resliceActor,
            renderer: obj.renderer,
            resetFocalPoint: true, // At first initilization, center the focal point to the image center
            computeFocalPointOffset: true, // Allow to compute the current offset between display reslice center and display focal point
            sphereSources: obj.sphereSources,
            slider: obj.slider,
        });
        fullViewerForWidget(obj);
        obj.interactor.render();
    });

    view3D.renderer.resetCamera();
    view3D.renderer.resetCameraClippingRange();
    view3D.renderWindow.render();
    

    //setCenterlineData(archPointData);

    //viewPanoramic.renderer.resetCamera();
    //viewPanoramic.renderer.resetCameraClippingRange();
    //viewPanoramic.reslice.setInputData(image);
    //viewPanoramic.resliceAcotr.setUserMatrix(viewPanoramic.reslice.getResliceAxes());
    //viewPanoramic.renderWindow.render();

    // set max number of slices to slider.
    const maxNumberOfSlices = vec3.length(image.getDimensions());
    document.getElementById('slabNumber').max = maxNumberOfSlices;

    fetch('./implant.stl').then(res=>res.arrayBuffer()).then(async(buffer)=>{
        handleImplantData(buffer);
    });
}
function handleImplantData(buffer:ArrayBuffer) {
    const reader = stlBuffer2Reader(buffer);
    const obb = infoObb(reader.getOutputData(), {more:true});
    console.log(obb);
    const mapper0 = vtkMapper.newInstance({scalarVisibility:false});
    if (true) {
        mapper0.setInputConnection(reader.getOutputPort());
    } else {
        mapper0.setInputData(reader.getOutputData());
    }
    const actorImplant = vtkActor.newInstance();
    actorImplant.setMapper(mapper0);
    actorImplant.getProperty().setColor(0,1,0);
    const matrix = vtkMatrixBuilder
        .buildFromDegree()
        .identity()
        //.translate(50, 50, 25)
        .translate(0, 0, -5)
        //.scale(5,5,5)
        .getMatrix();
    //actorImplant.setUserMatrix(matrix);
    actorImplant.modified();
    actorImplant.getMapper().update();
    view3D.renderer.addActor(actorImplant);
   
    //view3D.renderer.addActor(actorCut);
    //view3D.renderWindow.render();
    
    //implantList.push({ plane, cutter, actorCut, actorImplant });

    oneImplantForAxes(reader, actorImplant, obb);
}
function oneImplantForAxes(reader, actor, obb) {
    const tmp = { actor, obb, actors: [] };
    [0,1,2].forEach(idx=>{
        const plane = vtkPlane.newInstance();
        const cutter = vtkCutter.newInstance();
        cutter.setInputConnection(reader.getOutputPort());
        plane.setNormal(obb.axes[idx]);
        plane.setOrigin(actor.getPositionByReference());
        cutter.setCutFunction(plane);
        
        const mapper = vtkMapper.newInstance();
        mapper.setInputConnection(cutter.getOutputPort());
        const actorCut = vtkActor.newInstance();
        actorCut.setMapper(mapper);
        actorCut.getProperty().setOpacity(1.0);
        actorCut.getProperty().setRepresentation(2);
        actorCut.getProperty().setLineWidth(4);
        if (idx == 0) actorCut.getProperty().setColor(1,1,0);
        else if (idx == 1) actorCut.getProperty().setColor(0,1,1);
        else if (idx == 2) actorCut.getProperty().setColor(1,0,1);
        if (true) {
            const offset = 15;
            const cutMatrix = vtkMatrixBuilder
                .buildFromDegree()
                .identity()
                .translate(idx==0?15:0, idx==1?offset:0, idx==2?offset:0)
                .scale(5,5,5)
                .getMatrix();
            actorCut.setUserMatrix(cutMatrix);
        }
        tmp.actors.push({ plane, cutter, actorCut });
        const map1 = [2,1,0];
        viewAttributes[map1[idx]].renderer.addActor(actorCut);
        viewAttributes[map1[idx]].renderWindow.render();
        view3D.renderer.addActor(actorCut);
    });
    view3D.renderWindow.render();

    implantList.push(tmp);
}


// ----------------------------------------------------------------------------
// Define panel interactions
// ----------------------------------------------------------------------------
function updateViews() {
  viewAttributes.forEach((obj, i) => {
    updateReslice({
      viewType: xyzToViewType[i],
      reslice: obj.reslice,
      actor: obj.resliceActor,
      renderer: obj.renderer,
      resetFocalPoint: true,
      computeFocalPointOffset: true,
      sphereSources: obj.sphereSources,
      resetViewUp: true,
    });
    obj.renderWindow.render();
  });
  view3D.renderer.resetCamera();
  view3D.renderer.resetCameraClippingRange();
}

checkboxTranslation.addEventListener('change', (ev) => {
  viewAttributes.forEach((obj) =>
    obj.widgetInstance.setEnableTranslation(checkboxTranslation.checked)
  );
});


checkboxShowRotation.addEventListener('change', (ev) => {
  widgetState
    .getStatesWithLabel('rotation')
    .forEach((handle) => handle.setVisible(checkboxShowRotation.checked));
  viewAttributes.forEach((obj) => {
    obj.interactor.render();
  });
  checkboxRotation.checked = checkboxShowRotation.checked;
  checkboxRotation.disabled = !checkboxShowRotation.checked;
  checkboxRotation.dispatchEvent(new Event('change'));
});

checkboxRotation.addEventListener('change', (ev) => {
  viewAttributes.forEach((obj) =>
    obj.widgetInstance.setEnableRotation(checkboxRotation.checked)
  );
 checkboxOrthogonality.disabled = !checkboxRotation.checked;
 checkboxOrthogonality.dispatchEvent(new Event('change'));
});


checkboxOrthogonality.addEventListener('change', (ev) => {
  viewAttributes.forEach((obj) =>
    obj.widgetInstance.setKeepOrthogonality(checkboxOrthogonality.checked)
  );
});


const checkboxScaleInPixels = document.getElementById('checkboxScaleInPixels');
checkboxScaleInPixels.addEventListener('change', (ev) => {
  widget.setScaleInPixels(checkboxScaleInPixels.checked);
  viewAttributes.forEach((obj) => {
    obj.interactor.render();
  });
});

const opacity = document.getElementById('opacity');
opacity.addEventListener('input', (ev) => {
  const opacityValue = document.getElementById('opacityValue');
  opacityValue.innerHTML = ev.target.value;
  widget
    .getWidgetState()
    .getStatesWithLabel('handles')
    .forEach((handle) => handle.setOpacity(ev.target.value));
  viewAttributes.forEach((obj) => {
    obj.interactor.render();
  });
});

const optionSlabModeMin = document.getElementById('slabModeMin');
optionSlabModeMin.value = SlabMode.MIN;
const optionSlabModeMax = document.getElementById('slabModeMax');
optionSlabModeMax.value = SlabMode.MAX;
const optionSlabModeMean = document.getElementById('slabModeMean');
optionSlabModeMean.value = SlabMode.MEAN;
const optionSlabModeSum = document.getElementById('slabModeSum');
optionSlabModeSum.value = SlabMode.SUM;
const selectSlabMode = document.getElementById('slabMode');
selectSlabMode.addEventListener('change', (ev) => {
  viewAttributes.forEach((obj) => {
    obj.reslice.setSlabMode(Number(ev.target.value));
  });
  updateViews();
});

const sliderSlabNumberofSlices = document.getElementById('slabNumber');
sliderSlabNumberofSlices.addEventListener('change', (ev) => {
  const trSlabNumberValue = document.getElementById('slabNumberValue');
  trSlabNumberValue.innerHTML = ev.target.value;
  viewAttributes.forEach((obj) => {
    obj.reslice.setSlabNumberOfSlices(ev.target.value);
  });
  updateViews();
});

const buttonReset = document.getElementById('buttonReset');
buttonReset.addEventListener('click', () => {
    console.log(initialPlanesState, widgetState);
    widgetState.setPlanes({ ...initialPlanesState });
    widget.setCenter(widget.getWidgetState().getImage().getCenter());
    updateViews();
});

const selectInterpolationMode = document.getElementById('selectInterpolation');
selectInterpolationMode.addEventListener('change', (ev) => {
  viewAttributes.forEach((obj) => {
    obj.reslice.setInterpolationMode(Number(ev.target.selectedIndex));
  });
  updateViews();
});

const checkboxWindowLevel = document.getElementById('checkboxWindowLevel');
checkboxWindowLevel.addEventListener('change', (ev) => {
  viewAttributes.forEach((obj, index) => {
    if (index < 3) {
      obj.interactor.setInteractorStyle(
        checkboxWindowLevel.checked
          ? vtkInteractorStyleImage.newInstance()
          : vtkInteractorStyleTrackballCamera.newInstance()
      );
    }
  });
});

const inputNiiFile = document.getElementById('inputNiiFile');
inputNiiFile.addEventListener('change', async (ev) => {
    const file = ev.target.files[0];
    console.log(file, file.type);
    const arrayBuffer = await file.arrayBuffer();
    if (file.type.endsWith('gzip')) {
        handleNiiData(handleGzFile(arrayBuffer));
    } else if (file.type.endsWith('zip')) {
        handleNiiData(handleGzFile(arrayBuffer, false));
    } else {
        handleNiiData(arrayBuffer); 
    }
});
const inputArchCurveFile = document.getElementById('inputArchCurveFile');
inputArchCurveFile.addEventListener('change', async(ev) => {
    const file = ev.target.files[0];
    const archcurve = await file.text();
    const inPoints = archcurve.split('\n').filter(e=>e).map(e=>e.split(' ').map(e=>parseFloat(e)));
    let archPointData = [];
    let idx = 0;
    inPoints.forEach((pt)=>{
        archPointData.push([pt[0], pt[1], pt[2]]);
    });
    archPointData = generateUniformCurve(archPointData, 800);
    handleArchData(archPointData);
});
