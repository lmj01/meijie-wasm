import vtkMath from '@kitware/vtk.js/Common/Core/Math';
import vtkCamera from '@kitware/vtk.js/Rendering/Core/Camera';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';
import vtkCellPicker from '@kitware/vtk.js/Rendering/Core/CellPicker';
import vtkPlaneSource from '@kitware/vtk.js/Filters/Sources/PlaneSource';
import vtkConeSource from '@kitware/vtk.js/Filters/Sources/ConeSource';
import vtkSphereSource from '@kitware/vtk.js/Filters/Sources/SphereSource';
import vtkArrowSource from '@kitware/vtk.js/Filters/Sources/ArrowSource';
import vtkLineSource from '@kitware/vtk.js/Filters/Sources/LineSource';
import vtkLineFilter from '@kitware/vtk.js/Filters/General/LineFilter';
import vtkCoordinate from '@kitware/vtk.js/Rendering/Core/Coordinate';
import vtkAppendPolyData from '@kitware/vtk.js/Filters/General/AppendPolyData';
import vtkOBBTree from '@kitware/vtk.js/Filters/General/OBBTree';
import vtkMatrixBuilder from '@kitware/vtk.js/Common/Core/MatrixBuilder.js'
import { vec4, mat4, vec3, mat3 } from 'gl-matrix';

export function newSphere(center, color = [1,0,0], opt = {}) {
    const source = vtkSphereSource.newInstance({
        radius: opt.radius || 5,
    });
    source.setCenter(center);
    const mapper = vtkMapper.newInstance();
    mapper.setInputConnection(source.getOutputPort());
    const actor = vtkActor.newInstance();
    actor.getProperty().setColor(color);
    actor.setMapper(mapper);
    return {actor, source};
}

export function getInfoAxes(opt = {}) {
    let size = opt.size || 10;
    const x = newSphere([size*1,0,0], [1,0,0]);
    const y = newSphere([0,size*3,0], [0,1,0]);
    const z = newSphere([0,0,size*5], [0,0,1]);
    return [x,y,z];
}

export function useProjector() { 

    let hudActor;
    if (false) {
        const hudCone = vtkConeSource.newInstance({height: 35.2, radius: 3});
        const hudMapper = vtkMapper.newInstance();
        hudMapper.setInputConnection(hudCone.getOutputPort());
        hudActor = vtkActor.newInstance();
        hudActor.setPosition(0, 10,0);
        hudActor.getProperty().setColor(1,1,0);
        hudActor.setMapper(hudMapper);
    }

    const ud = {};
    [0,1,2].forEach(idx=>{
        const mapper = vtkMapper.newInstance();
        const actor = vtkActor.newInstance();
        actor.setMapper(mapper);
        actor.setPickable(true)
        //actor.getProperty().setRepresentationToWireframe();
        actor.getProperty().setRepresentation(2);
        //actor.getProperty().setLineWidth(0.05);
        actor.getProperty().setColor(0.5, 0.5, 0.5);
        const renderer = vtkRenderer.newInstance();
        renderer.setLayer(1);
        // hud 
        //renderer.setErase(false);
        renderer.setPreserveColorBuffer(true);
        renderer.setPreserveDepthBuffer(true);
        renderer.setViewport(0, 0, 1, 1);
        renderer.addActor(actor);
        if (hudActor) renderer.addActor(hudActor);
    
        const camera = vtkCamera.newInstance();
        camera.setParallelProjection(true);
        renderer.setActiveCamera(camera);
        if (idx === 0) {
        } else if (idx === 1) {
        } else if (idx === 2) {
            //camera.setPosition(0, 0, 100);
            //camera.setFocalPoint(0, 0, 0);
            camera.setViewUp(0, 1, 1);
        }
        
        const picker = vtkCellPicker.newInstance();
        picker.setPickFromList(1);
        picker.setTolerance(0);
        picker.initializePickList();
        picker.addPickList(actor);
        if (hudActor) picker.addPickList(hudActor);

        ud[idx] = {
            actor,
            mapper,
            renderer,
            camera,
            picker,
            init: false,
            idx,
        };        
    });
    window.ud1 = ud;
    // 数据
    const bindProjectorData = (inputData) => {
        if (true) {
            const matrix = vtkMatrixBuilder
                .buildFromDegree()
                .identity()
                .scale(2,2,2)
                .getMatrix();
            [0,1,2].forEach((idx)=>{
                ud[idx].mapper.setInputData(inputData);
                ud[idx].actor.getProperty().setColor(0.5, 0.5, 0.5);
                ud[idx].actor.setUserMatrix(matrix);
            });
        } else {
            const lineFilter = vtkLineFilter.newInstance();
            lineFilter.setInputData(inputData);
            [0,1,2].forEach((idx)=>{
                ud[idx].mapper.setInputData(lineFilter.getOutputData());
            });
        }
    }
    // 更新
    const updateProjector = (viewer, options = {})=>{
        const type = options.type;
        const one = ud[type];

        function getPick(cd, info, type) {
            const mouse = cd.position;
            // 将屏幕坐标转换为picker坐标
            const view = viewer.renderWindow.getViews()[0];
            const displayPoint = [mouse.x, view.getSize()[1] - mouse.y, 0];
            one.picker.pick(displayPoint, one.renderer);
            if (one.picker.getActors().length == 0) {
                if (type == 'move') {
                    one.isHover = false;
                } else if (type == 'down') {
                    one.isDown = false;
                } else if (type == 'up') {
                    one.isDown = false;
                }
            } else {
                const pickPoint = one.picker.getPickPosition();
                if (type == 'move') {
                    if (one.isDown) {
                        one.actor.setPosition(pickPoint);
                        const deltaX = pickPoint[0] - one.prePickPos[0];
                        const deltaY = pickPoint[1] - one.prePickPos[1];
                        const deltaZ = pickPoint[2] - one.prePickPos[2];
                        one.prePickPos = pickPoint;
                        one.deltaX += deltaX;
                        one.deltaY += deltaY;
                        one.deltaZ += deltaZ;
                        const pos = one.actor.getPosition();
                        one.actor.setPosition(pos[0] + deltaX, pos[1] + deltaY, pos[2] + deltaZ);
                        one.renderWindow.render();
                    } else {
                        one.isHover = true;
                    }
                } else if (type == 'down') {
                    one.downPickPoint = pickPoint;
                    one.downPosition = one.actor.getPosition();
                    if (one.isHover) {
                        console.log('is hover, and down');
                        one.isDown = true;
                        one.deltaX = 0;
                        one.deltaY = 0;
                        one.deltaZ = 0;
                        one.prePickPos = pickPoint;
                    }
                } else if (type == 'up') {
                    if (one.isDown) {
                        const upPosition = one.actor.getPosition();
                        one.upPosition = one.actor.getPosition();
                        let vOffset = 0, hOffset = 0;
                        if (false) {
                            if (one.idx == 0) {
                                vOffset = one.downPosition[1] - one.prePosition[1];
                                hOffset = one.downPosition[2] - one.prePosition[2];
                                one.actor.setPosition(pos[0], pos[1] + vOffset, pos[2] + hOffset);
                            } else if (one.idx == 1) {
                                vOffset = one.downPosition[0] - one.prePosition[0];
                                hOffset = one.downPosition[2] - one.prePosition[2];
                                one.actor.setPosition(pos[0] + vOffset, pos[1], pos[2] + hOffset);
                            } else if (one.idx == 2) {
                                vOffset = one.downPosition[0] - one.prePosition[0];
                                hOffset = one.downPosition[1] - one.prePosition[1];
                                one.actor.setPosition(pos[0] + vOffset, pos[1] + hOffset, pos[2]);
                            }
                            console.log('offset', vOffset, hOffset);
                        }
                        //one.actor.setPosition();
                    }
                    one.isDown = false;
                    one.prePickPos = null;
                }
                const pickCellId = one.picker.getCellId();
                //console.log(`pick cell ${ pickCellId}`);
            }
            viewer.renderWindow.render();
        }
        if (!one.init) {
            one.init = true;
            viewer.renderWindow.addRenderer(one.renderer);
            const interactor = viewer.renderWindow.getInteractor();
            interactor.onLeftButtonPress((cd)=>{
                getPick(cd, one, 'down');
                if (options.update) options.update(one);
            });
            interactor.onMouseMove((cd)=>{
                getPick(cd, one, 'move');
                if (one.isDown) {
                } else {
                    if (one.isHover) {
                        one.actor.getProperty().setColor(1.0, 1.0, 0.0);
                    } else {
                        one.actor.getProperty().setColor(0.5, 0.5, 0.5);
                    }
                    console.log('hover',one.isHover);
                    // 禁用第一层的交互事件
                    viewer.renderer.setInteractive(!one.isHover);
                    one.actor.modified();
                    viewer.renderWindow.render();
                }
                //console.log('move', one.isHover, one.idx);
                if (options.update) options.update(one);
            });
            interactor.onLeftButtonRelease((cd)=>{
                getPick(cd, one, 'up');
                if (options.update) options.update(one, {type:'updatePosition'});
            });
        }
        const focalPoint = viewer.renderer.getActiveCamera().getFocalPointByReference();
        one.camera.setFocalPoint(focalPoint[0], focalPoint[1], focalPoint[2]);
        if (type === 0) {
            one.camera.setViewUp(0, 0, -1);
        } else if (type === 1) { 
            one.camera.setViewUp(0, 0, 1);
        } else if (type === 2) {
            one.camera.setViewUp(0, 1, 1);
        } else {
            throw new Error(`unsupport type ${type}`);
        }
        one.camera.setParallelScale(50);
        //one.renderer.resetCameraClippingRange();
        viewer.renderWindow.render();
    }

    return {
        updateProjector,
        bindProjectorData,
    };
}

export function useArbitrarilyAxis(origin, direction, options = {}) {
    const length = options.length || 10;
    const radius = options.radius || 1.4;
    const point1 = [...origin], point2 = [...origin];
    direction.map((v,i)=>{
        point1[i] -= v * length/2;
        point2[i] += v * length/2;
    });
    const line = vtkLineSource.newInstance({
        point1,
        point2,
    });
    const dir = point2.map((v,i) => v- point1[i]);
    const len = Math.hypot(...dir);
    const height = Math.max(dir[0] * 0.1, dir[1] * 0.1, dir[2] * 0.1);
    const center = [
        point1[0] + dir[0] * 0.9,
        point1[1] + dir[1] * 0.9,
        point1[2] + dir[2] * 0.9,
    ];
    center[0] = point2[0] - dir[0] * 0.01;
    center[1] = point2[1] - dir[1] * 0.01;
    center[2] = point2[2] - dir[2] * 0.01;
    // 箭头放置point1
    const cone = vtkConeSource.newInstance({
        center,
        direction,
        height,
        radius,
    });

    const append = vtkAppendPolyData.newInstance();
    append.setInputConnection(line.getOutputPort());
    append.addInputConnection(cone.getOutputPort());
    const mapper = vtkMapper.newInstance();
    mapper.setInputConnection(append.getOutputPort());
    const actor = vtkActor.newInstance();
    //actor.getProperty().setLineWidth(3);
    actor.setMapper(mapper);
    return {
        actor, 
    }
}

export function infoBounds(actor) {
    const bounds = actor.getBounds();
    const center = [
        (bounds[1] - bounds[0]) / 2,
        (bounds[3] - bounds[2]) / 2,
        (bounds[5] - bounds[4]) / 2
    ];
    const size = [
        (bounds[1] - bounds[0]),
        (bounds[3] - bounds[2]),
        (bounds[5] - bounds[4])
    ];
    const tmp = {
        center,
        size,
    }
    return tmp;
}

export function infoPolyData(polyData) {
    if (polyData.isA && polyData.isA('vtkPolyData')) {
        const tmp = {};
        tmp.countCell = polyData.getNumberOfCells();
        tmp.countPoint = polyData.getNumberOfPoints();
        return tmp;
    } 
    throw new Error('only parse PolyData info');
}

export function infoObb(polyData, opt = {}) {
    const obbTree = vtkOBBTree.newInstance();
    if (polyData.isA && polyData.isA('vtkPolyData')) {
        obbTree.setDataset(polyData);
    } else {
        throw new Error('data must be PolyData');
    }
    obbTree.buildLocator();
    const tmp = { obbTree };
    tmp.axes = obbTree.getTree().getAxes();
    tmp.corner = obbTree.getTree().getCorner();
    if (opt.more) {
        const center = [0,0,0], longAxis = [0, 0, 0], midAxis = [0, 0, 0], shortAxis = [0, 0, 0], size = [0, 0, 0];
        obbTree.computeOBBFromDataset(polyData, center, longAxis, midAxis, shortAxis, size);
        const maxLen = Math.max(...size), minLen = Math.min(...size);
        tmp.size = size;
        tmp.center = center;
        tmp.longAxis = longAxis;
        tmp.midAxis = midAxis;
        tmp.shortAxis = shortAxis;
    }
    return tmp;
}

export function vec3ApplyMatrix4(v3, m4, options = {}) {
    const mat = mat4.clone(m4);
    if (options.onlyRotate) {
        mat[12] = 0;
        mat[13] = 0;
        mat[14] = 0;
    }
    const result = vec4.create();
    vec4.transformMat4(result, [...v3,1.0], mat);
    const res = [];
    for (let i = 0; i < 3; i++) res[i] = result[i];
    return res;
}


export function addNewLayer(layer = 1, opt = {}) { 

    const actor = opt.actor;
    const arrow = opt.arrow;
    const index = opt.index || 1;
    const oldColor = actor.getProperty().getColor();
    const renderer = vtkRenderer.newInstance();
    renderer.setLayer(layer);
    renderer.setErase(false);
    renderer.setPreserveColorBuffer(true);
    renderer.setPreserveDepthBuffer(true);
    renderer.setViewport(0, 0, 1, 1);
    renderer.addActor(actor);
    if (arrow && !opt.noArrow) renderer.addActor(arrow);

    const useCoordinate = true;
    const coordinate = vtkCoordinate.newInstance();
    coordinate.setCoordinateSystemToDisplay(); // 屏幕坐标系 

    const picker = vtkCellPicker.newInstance();
    picker.setPickFromList(1);
    picker.setTolerance(0.005);
    picker.initializePickList();
    picker.addPickList(actor);
    const one = {};
    const on = (viewer, options = {})=>{
        function getPick(cd, type) {
            if (renderer != cd.pokedRenderer) {
                return;
            }
            const mouse = cd.position;
            const pos = [mouse.x, mouse.y, 0];
            picker.pick(pos, renderer);
            const actors = picker.getActors();
            if (actors.length == 0) {
                if (type == 'move') {
                    one.isHover = false;
                } else if (type == 'down') {
                    one.isDown = false;
                } else if (type == 'up') {
                    one.isDown = false;
                }
            } else {
                //console.log('name is ', actors[0].get().name); 
                const pickPoint = picker.getPickPosition();
                if (type == 'move') {
                    if (one.isDown) {
                        let deltaX = 0, deltaY = 0, deltaZ = 0;
                        if (useCoordinate) {
                            coordinate.setValue(...pos);
                            const nowWorldPos = coordinate.getComputedWorldValue(renderer);
                            deltaX = nowWorldPos[0] - one.lastWorldPos[0];
                            deltaY = nowWorldPos[1] - one.lastWorldPos[1];
                            deltaZ = nowWorldPos[2] - one.lastWorldPos[2];
                            one.lastWorldPos = nowWorldPos;
                        } else {
                            deltaX = pickPoint[0] - one.lastWorldPos[0];
                            deltaY = pickPoint[1] - one.lastWorldPos[1];
                            deltaZ = pickPoint[2] - one.lastWorldPos[2];
                            one.lastWorldPos = pickPoint;
                        }
                        if (options.cb) options.cb({deltaX, deltaY, deltaZ, type, index});
                        if (false) {
                            one.deltaX += deltaX;
                            one.deltaY += deltaY;
                            one.deltaZ += deltaZ;
                            const originPos = actor.getPosition();
                            if (index == 0) {
                                actor.setPosition(originPos[0], originPos[1] + deltaY, originPos[2] + deltaZ);
                            } else if (index == 1) {
                                actor.setPosition(originPos[0] + deltaX, originPos[1], originPos[2] + deltaZ);
                            } else if (index == 2) {
                                actor.setPosition(originPos[0] + deltaX, originPos[1] + deltaY, originPos[2]);
                            }
                        }
                    } else {
                        one.isHover = true;
                    }
                } else if (type == 'down') {
                    if (one.isHover) {
                        if (useCoordinate) {
                            coordinate.setValue(...pos);
                            one.lastWorldPos = coordinate.getComputedWorldValue(renderer);
                        } else {
                            one.lastWorldPos = pickPoint;
                        }
                        one.isDown = true;
                        one.deltaX = 0;
                        one.deltaY = 0;
                        one.deltaZ = 0;
                        if (options.cb) options.cb({type, index, one});
                    }
                } else if (type == 'up') {
                    if (one.isDown) {
                        if (options.cb) options.cb({type, index});
                    }
                    one.isDown = false;
                    one.lastWorldPos = null;
                } else if (type == 'downR') {
                    if (options.cb) options.cb({type, actors: picker.getActors(),index});
                }
            }
            //console.log('isHover', one.isHover);
            if (one.isHover) {
                actor.getProperty().setColor(1.0, 1.0, 0.0);
            } else {
                actor.getProperty().setColor(oldColor);
            }
            // 禁用第一层的交互事件
            viewer.renderer.setInteractive(!one.isHover);
            viewer.renderWindow.render();
        }
        if (!one.init) {
            one.init = true;
            viewer.renderWindow.addRenderer(renderer);
            renderer.setActiveCamera(viewer.renderer.getActiveCamera());
            const interactor = viewer.renderWindow.getInteractor();
            interactor.onLeftButtonPress((cd)=>{
                getPick(cd, 'down');
            });
            interactor.onMouseMove((cd)=>{
                getPick(cd, 'move');
            });
            interactor.onLeftButtonRelease((cd)=>{
                getPick(cd, 'up');
            });
            interactor.onRightButtonPress((cd)=>{
                getPick(cd, 'downR');
            });
        }
    }
    function getRender() { return renderer; }
    return {
        on,
        one,
        getRender,
    };
}
