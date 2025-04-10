# meijie-wasm

## dev

```shell
npm init -w ./packages/mjdraco
npm init -w ./packages/mjdeformation
npm init -w ./packages/tool
npm init -w ./packages/mjpage
npm init -w ./packages/mjvtk
npm init -w ./packages/mjffmpeg
```

### esm
- [WebAssembly/ES Module Integration](https://github.com/WebAssembly/esm-integration/tree/main/proposals/esm-integration)
- vite-plugin-wasm 只能作为路径，如Draco那样适用，不能作为es-module适用
- [vite-plugin-wasm-module-workers (VPWMW)](https://github.com/superhighfives/vite-plugin-wasm-module-workers)

## bvh

- http://localhost:7110/bvh.html

## wasm

- [vite load wasm problem](https://github.com/donalffons/opencascade.js/issues/268)

## vtk

- [vtk latest documents](https://docs.vtk.org/en/latest/)
    - [vtk C++ Api](https://vtk.org/doc/nightly/html/index.html)

- [vtk-vue](https://github.com/Kitware/vtk-js/blob/master/Documentation/content/docs/vtk_vue.md)

## bgfx
- [A simple 3D rendering project using bgfx that displays a rotating cube. The project supports both native (desktop) builds and WebAssembly compilation via Emscripten.](https://github.com/paulocoutinhox/bgfx-app)

## draco 

```shell
# linux
export EMSCRIPTEN=/path/emsdk/upstream/emscripten
# windows
set EMSCRIPTEN=X:\path\emsdk\upstream\emscripten
```


