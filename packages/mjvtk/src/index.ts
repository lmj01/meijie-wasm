import '@kitware/vtk.js/Rendering/Profiles/Geometry';

import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';

import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkAxesActor from '@kitware/vtk.js/Rendering/Core/AxesActor';
import vtkRenderWindowInteractor from '@kitware/vtk.js/Rendering/Core/RenderWindowInteractor';
import vtkCalculator from '@kitware/vtk.js/Filters/General/Calculator';
import vtkConeSource from '@kitware/vtk.js/Filters/Sources/ConeSource';
import { AttributeTypes } from '@kitware/vtk.js/Common/DataModel/DataSetAttributes/Constants';
import { FieldDataTypes } from '@kitware/vtk.js/Common/DataModel/DataSet/Constants';

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
renderer.addActor(axesActor);

renderer.addActor(actor);
renderer.resetCamera();
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
  renderWindow.render();
});
resolutionChange?.addEventListener('input', (e) => {
  const resolution = Number(e.target?.value);
  coneSource.setResolution(resolution);
  renderWindow.render();
});