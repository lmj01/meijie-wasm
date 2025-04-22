#include "shared.hpp"
#include "tri_tri_intersect.h"
using namespace emscripten;

int add(int a, int b) {
    return a + b;
}

EMSCRIPTEN_BINDINGS(Shared) {
    // register_type<Int8Array>("Int8Array");
    // register_type<Int16Array>("Int16Array");
    // register_type<Int32Array>("Int32Array");
    // register_type<Uint8Array>("Uint8Array");
    // register_type<Uint16Array>("Uint16Array");
    // register_type<Uint32Array>("Uint32Array");
    // register_type<Float32Array>("Float32Array");
    // register_type<Float64Array>("Float64Array");
    // register_type<BigInt64Array>("BigInt64Array");
    // register_type<BigUint64Array>("BigUint64Array");

    function("tri_tri_overlap_test_3d", &tri_tri_overlap_test_3d, allow_raw_pointers());
    function("add", &add);
}
