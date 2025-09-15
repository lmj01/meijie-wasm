import '@kitware/vtk.js/Rendering/Profiles/Geometry';

import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';

import vtkPoints from '@kitware/vtk.js/Common/Core/Points';
import vtkPolyData from '@kitware/vtk.js/Common/DataModel/PolyData';
import vtkCellArray from '@kitware/vtk.js/Common/Core/CellArray';

import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkAxesActor from '@kitware/vtk.js/Rendering/Core/AxesActor';
import vtkRenderWindowInteractor from '@kitware/vtk.js/Rendering/Core/RenderWindowInteractor';
import vtkCalculator from '@kitware/vtk.js/Filters/General/Calculator';
import vtkTubeFilter from '@kitware/vtk.js/Filters/General/TubeFilter';
import vtkConeSource from '@kitware/vtk.js/Filters/Sources/ConeSource';
import { AttributeTypes } from '@kitware/vtk.js/Common/DataModel/DataSetAttributes/Constants';
import { FieldDataTypes } from '@kitware/vtk.js/Common/DataModel/DataSet/Constants';
import vtkWidgetManager from '@kitware/vtk.js/Widgets/Core/WidgetManager';
import { 
    createInteractiveOrientationMarkerWidget,
    alignCameraOnViewWidgetOrientationChange,
} from '@kitware/vtk.js/Widgets/Widgets3D/InteractiveOrientationWidget/helpers';

const controlPanel = `
<table>
  <tr>
    <td>
      <select class="representations" style="width: 100%">
        <option value="0">Points</option>
        <option value="1">Wireframe</option>
        <option value="2" selected>Surface</option>
      </select>
    </td>
  </tr>
  <tr>
    <td>
      <input class="resolution" type="range" min="4" max="80" value="6" />
    </td>
  </tr>
  <tr>
    <td>
      <select class="view-directions" style="width: 100%">
        <option value="front" selected>Front</option>
        <option value="back">Back</option>
        <option value="right">Right</option>
        <option value="left">Left</option>
        <option value="top">Top</option>
        <option value="bottom">Bottom</option>
      </select>
    </td>
  </tr>  
</table>
`;

// ----------------------------------------------------------------------------
// Standard rendering code setup
// ----------------------------------------------------------------------------

const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance();
const renderer = fullScreenRenderer.getRenderer();
const renderWindow = fullScreenRenderer.getRenderWindow();
const activeCamera = renderer.getActiveCameraAndResetIfCreated();

// ----------------------------------------------------------------------------
// Example code
// ----------------------------------------------------------------------------

const coneSource = vtkConeSource.newInstance({ height: 1.0 });
const filter = vtkCalculator.newInstance();

filter.setInputConnection(coneSource.getOutputPort());
filter.setFormula({
  getArrays: inputDataSets => ({
    input: [],
    output: [
      { location: FieldDataTypes.CELL, name: 'Random', dataType: 'Float32Array', attribute: AttributeTypes.SCALARS },
    ],
  }),
  evaluate: (arraysIn, arraysOut) => {
    const [scalars] = arraysOut.map(d => d.getData());
    for (let i = 0; i < scalars.length; i++) {
      scalars[i] = Math.random();
    }
  },
});

const mapper = vtkMapper.newInstance();
mapper.setInputConnection(filter.getOutputPort());

const actor = vtkActor.newInstance();
actor.setMapper(mapper);

const interactor = vtkRenderWindowInteractor.newInstance();
interactor.setRenderWindow(renderWindow);
const axesActor = vtkAxesActor.newInstance();
axesActor.setUserMatrix([1,0,0,0, 0,1,0,0, 0,0,1,0, 0, 0, 0, 1]);
renderer.addActor(axesActor);

/////////start tube example
/**
 *
 */
const tmpPoints = new Float32Array([
    0,0,0,
    1,1,1,
    2,1,0,
    3,2,1,
    4,0,0,
    5,1,-1,
    6,2,0
]);
const points1 = vtkPoints.newInstance();
points1.setData(tmpPoints);
const polydata1 = vtkPolyData.newInstance();
polydata1.setPoints(points1);
const line1 = vtkCellArray.newInstance();
const lineIdx = new Uint32Array(tmpPoints.length / 3 + 1);
lineIdx[0] = tmpPoints.length / 3;
for (let i = 0; i < tmpPoints.length/3; i++) {
    lineIdx[i + 1] = i;
}
line1.setData(lineIdx);
polydata1.setLines(line1);

const tubeFilter1 = vtkTubeFilter.newInstance();
console.log(tubeFilter1);
tubeFilter1.setInputData(polydata1);
tubeFilter1.setRadius(0.2);
tubeFilter1.setNumberOfSides(20);
tubeFilter1.update();

const mapper1 = vtkMapper.newInstance();
mapper1.setInputConnection(tubeFilter1.getOutputPort());
const actor1 = vtkActor.newInstance();
actor1.setMapper(mapper1);

renderer.addActor(actor1);
/////////end

////////////////////add widget 
const widgetManager = vtkWidgetManager.newInstance();
const {
    interactiveOrientationWidget, orientationMarkerWidget
} = createInteractiveOrientationMarkerWidget( widgetManager, renderWindow.getInteractor(), renderer);
const vm = widgetManager.addWidget(interactiveOrientationWidget);
const subscription = alignCameraOnViewWidgetOrientationChange(vm, renderer.getActiveCamera(), orientationMarkerWidget, widgetManager, renderWindow.render);
//////////////////////

renderer.addActor(actor);
renderer.resetCamera();
widgetManager.enablePicking();
renderWindow.render();
interactor.initialize();
interactor.start();
// -----------------------------------------------------------
// UI control handling
// -----------------------------------------------------------

fullScreenRenderer.addController(controlPanel);
const representationSelector = document.querySelector('.representations');
const viewDirSelector = document.querySelector('.view-directions');
const resolutionChange = document.querySelector('.resolution');

representationSelector?.addEventListener('change', (e) => {
  const newRepValue = Number(e.target?.value);
  actor.getProperty().setRepresentation(newRepValue);
  renderWindow.render();
});
viewDirSelector?.addEventListener('change', (e) => {
    const strDir = e.target?.value;
    const maxSide = 50;
    activeCamera.setFocalPoint(0, 0, 0);
    activeCamera.setViewUp(0, 1, 0);
    switch (strDir) {
        case 'front':      
          activeCamera.setPosition(0, 0, maxSide);
          break;
        case 'back':
          activeCamera.setPosition(0, 0, -maxSide);
          break;
        case 'right':
          activeCamera.setPosition(maxSide, 0, 0);
          break;
        case 'left':
          activeCamera.setPosition(-maxSide, 0, 0);
          break;
        case 'top':
          activeCamera.setPosition(0, maxSide, 0);
          break;
        case 'bottom':
          activeCamera.setPosition(0, -maxSide, 0);
          break;
        default: throw new Error(`un-support type ${strDir}`);
    }
    console.log(strDir);
    renderer.resetCamera();
    widgetManager.enablePicking();
    renderWindow.render();
});
resolutionChange?.addEventListener('input', (e) => {
  const resolution = Number(e.target?.value);
  coneSource.setResolution(resolution);
  renderWindow.render();
});
