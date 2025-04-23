#pragma once

#include <emscripten/bind.h>
#include <emscripten/val.h>

struct Point3 {
    double x;
    double y;
    double z;
    Point3(double x, double y, double z) : x(x), y(y), z(z) {}

    static void toArray(const Point3& p, double a[3]) {
        a[0] = p.x;
        a[1] = p.y;
        a[2] = p.z;
    }

    static Point3 from(double x, double y, double z) {
        return Point3{x,y,z};
    }
};

// EMSCRIPTEN_DECLARE_VAL_TYPE(Int8Array)
// EMSCRIPTEN_DECLARE_VAL_TYPE(Int16Array)
// EMSCRIPTEN_DECLARE_VAL_TYPE(Int32Array)
// EMSCRIPTEN_DECLARE_VAL_TYPE(Uint8Array)
// EMSCRIPTEN_DECLARE_VAL_TYPE(Uint16Array)
// EMSCRIPTEN_DECLARE_VAL_TYPE(Uint32Array)
// EMSCRIPTEN_DECLARE_VAL_TYPE(Float32Array)
// EMSCRIPTEN_DECLARE_VAL_TYPE(Float64Array)
// EMSCRIPTEN_DECLARE_VAL_TYPE(BigInt64Array)
// EMSCRIPTEN_DECLARE_VAL_TYPE(BigUint64Array)

