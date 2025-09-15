import vtkSTLReader from '@kitware/vtk.js/IO/Geometry/STLReader';
import pako from 'pako';

export function stlBuffer2Reader(buffer:ArrayBuffer) {
    const reader = vtkSTLReader.newInstance();
    reader.parseAsArrayBuffer(buffer);
    return reader;
}

export function handleGzFile(gzBuffer: ArrayBuffer, isGZip = true) {
    const head = new Uint8Array(gzBuffer.slice(0, 16));
    console.log([...head].map(e=>e.toString(16).padStart(2,'0')).join('-'));
    try {
        const niiBuffer = isGZip ? pako.inflate(gzBuffer) : pako.ungzip(gzBuffer);
        return niiBuffer.buffer;
    } catch(err) {
        console.log(err);
    }
}
