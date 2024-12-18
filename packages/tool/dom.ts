// This function loads a JavaScript file and adds it to the page. "path" is
// the path to the JavaScript file. "onLoadFunc" is the function to be called
// when the JavaScript file has been loaded.
export function loadJavaScriptFile(path: string, onLoadFunc: () => void) {
  const head = document.getElementsByTagName('head')[0];
  const element = document.createElement('script');
  element.type = 'text/javascript';
  element.src = path;
  if (onLoadFunc !== null)
    element.onload = onLoadFunc;

  head.appendChild(element);
}

const cFileType = {
  pdf: 'application/pdf;chartset=UTF-8',
  zip: 'application/zip;chartset=UTF-8',
  excel: 'application/vnd.ms-excel;chartset=UTF-8',
  binary: 'application/octet-stream',
  png: 'image/png',
  jpg: 'image/jpeg',
}

export function button2LocalUrl(arrayBuffer:ArrayBuffer, ftype = 'pdf', fileType?:string) {
  return window.URL.createObjectURL(new Blob([arrayBuffer], { type: fileType || cFileType[ftype] }));
}

function save2File(ftype:string, blob:ArrayBuffer, filename:string) {
  const tagA = document.createElement('a');
  tagA.href = button2LocalUrl(blob, ftype);
  tagA.download = filename;
  tagA.click();
}

export function saveZip(blob:ArrayBuffer, filename:string) {
  save2File(cFileType.zip, blob, filename || `${Date.toString()}.zip`);
}

export function toLocalFile(arrBuffer:ArrayBuffer, filename:string) {
  const href = window.URL.createObjectURL(new Blob([arrBuffer], {type: 'application/octet-stream'}));
  const tagA = document.createElement('a');
  tagA.href = href;
  tagA.download = filename;
  tagA.click();
  window.URL.revokeObjectURL(href);
}
