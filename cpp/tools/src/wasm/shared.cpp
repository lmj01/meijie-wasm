#include "shared.hpp"
#include "tri_tri_intersect.h"
using namespace emscripten;

int add(int a, int b) {
    return a + b;
}

int test_tri_tri_overlap_3d(Point3 p1, Point3 e1, Point3 e2, Point3 p2, Point3 e3, Point3 e4) {
    double dp1[3];
    double dp2[3];
    double de1[3];
    double de2[3];
    double de3[3];
    double de4[3];
    Point3::toArray(p1, dp1);
    Point3::toArray(e1, de1);
    Point3::toArray(e2, de2);
    Point3::toArray(p2, dp2);
    Point3::toArray(e3, de3);
    Point3::toArray(e4, de4);
    return tri_tri_overlap_test_3d(dp1, de1, de2, dp2, de3, de4);
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

    //value_object<Point3>("Point3")
    //    .field("x", &Point3::x)
    //    .field("y", &Point3::y)
    //    .field("z", &Point3::z)
    class_<Point3>("Point3")
        .constructor<double,double,double>()
        .property("x", &Point3::x)
        .property("y", &Point3::y)
        .property("z", &Point3::z)
        //.class_function("toArray", select_overload<void(const Point3&, double[3])>(&Point3::toArray))
        //.function("toArray", select_overload<void(const Point3&, double[3])>(&Point3::toArray))
        //.class_function("toArray", &Point3::toArray)
        .class_function("from", &Point3::from)
    ;

    //function("tri_tri_overlap_test_3d", &tri_tri_overlap_test_3d, allow_raw_pointers());
    function("test_tri_tri_overlap_3d", &test_tri_tri_overlap_3d, allow_raw_pointers());
    //function("test_tri_tri_overlap_3d", &test_tri_tri_overlap_3d);
    function("add", &add, return_value_policy::take_ownership());
}
