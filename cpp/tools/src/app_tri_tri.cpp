
#include <iostream>
#include "tri_tri_intersect.h"

inline void setPoint(double p[3], const double x, const double y, const double z)
{
    p[0] = x;
    p[1] = y;
    p[2] = z;
}

inline void computeEdges(double v0[3], double v1[3], const double p0[3], const double p1[3], const double p2[3])
{
    v0[0] = p1[0] - p0[0];
    v0[1] = p1[1] - p0[1];
    v0[2] = p1[2] - p0[2];
    v1[0] = p2[0] - p0[0];
    v1[1] = p2[1] - p0[1];
    v1[2] = p2[2] - p0[2];
}

int main()
{
    unsigned int numErrors(0), count(0);
    double p0[3], p1[3], p2[3], q0[3], q1[3], q2[3];
    double v0[3], v1[3], w0[3], w1[3];
    bool res, answer;
    int ret;

    std::cout << "Testing the correctness of tr_tri_intersect3D" << std::endl;

    {
        // Non excluding triangles in generic positions, big determinants, intersecting
        ++count;
        setPoint(p0, -21, -72, 63);
        setPoint(p1, -78, 99, 40);
        setPoint(p2, -19, -78, -83);
        setPoint(q0, 96, 77, -51);
        setPoint(q1, -95, -1, -16);
        setPoint(q2, 9, 5, -21);
        answer = true;

        computeEdges(v0, v1, p0, p1, p2);
        computeEdges(w0, w1, q0, q1, q2);
        int ret = tri_tri_overlap_test_3d(p0, v0, v1, q0, w0, w1);
        std::cout << "overlap test in 3d " << ret << std::endl;
        bool res = (ret != 0);

        if (res != answer)
        {
            std::cout << "# wrong answer on test " << count << "!\n";
            ++numErrors;
        }
    }
    return 0;
}
