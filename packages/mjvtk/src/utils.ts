import vtkSTLReader from '@kitware/vtk.js/IO/Geometry/STLReader';

export function stlBuffer2Reader(buffer:ArrayBuffer) {
    const reader = vtkSTLReader.newInstance();
    reader.parseAsArrayBuffer(buffer);
    return reader;
}
