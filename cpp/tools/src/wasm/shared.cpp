#include "shared.hpp"
//#include "tri_tri_intersect.h"
#include <vector>
using namespace emscripten;

int add(int a, int b) {
    return a + b;
}
double sub(std::vector<double> p) {
    double a = 0;
    
    if (!p.empty()) {
        a += p.at(0);
    }
    return a;
}
int tri_tri_overlap_3d(double p1[3], double q1[3], double r1[3],
        double p2[3], double q2[3], double r2[3]) {
    //return tri_tri_overlap_test_3d(p1, q1, r1, p2, q2, r2);
    return 0;
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

    //function("tri_tri_overlap_test_3d", &tri_tri_overlap_test_3d);
    //function("tri_tri_overlap_3d", &tri_tri_overlap_3d);
    function("add", &add);
    function("sub", &sub);
}
