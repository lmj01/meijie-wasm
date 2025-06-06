// TypeScript bindings for emscripten-generated code.  Automatically generated at compile time.
declare namespace RuntimeExports {
    let HEAPF32: any;
    let HEAPF64: any;
    let HEAP_DATA_VIEW: any;
    let HEAP8: any;
    let HEAPU8: any;
    let HEAP16: any;
    let HEAPU16: any;
    let HEAP32: any;
    let HEAPU32: any;
    let HEAP64: any;
    let HEAPU64: any;
}
interface WasmModule {
}

export interface Point3 {
  x: number;
  y: number;
  z: number;
  delete(): void;
}

interface EmbindModule {
  Point3: {new(_0: number, _1: number, _2: number): Point3; from(_0: number, _1: number, _2: number): Point3};
  test_tri_tri_overlap_3d(_0: Point3, _1: Point3, _2: Point3, _3: Point3, _4: Point3, _5: Point3): number;
  add(_0: number, _1: number): number;
}

export type MainModule = WasmModule & typeof RuntimeExports & EmbindModule;
export default function MainModuleFactory (options?: unknown): Promise<MainModule>;
