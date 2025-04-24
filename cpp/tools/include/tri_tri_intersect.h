#ifndef TRI_TRI_INTERSECT_H
#define TRI_TRI_INTERSECT_H

#ifdef __cplusplus
extern "C" {
#endif

/**
 * https://github.com/erich666/jgt-code
 * https://github.com/erich666/jgt-code/tree/master/Volume_08/Number_1/Guigue2003
 * https://stackoverflow.com/questions/1496215/triangle-triangle-intersection-in-3d-space
 */

 /* function prototype */

// Three-dimensional Triangle-Triangle Overlap Test
int tri_tri_overlap_test_3d(double p1[3], double q1[3], double r1[3], 
    double p2[3], double q2[3], double r2[3]);


// Three-dimensional Triangle-Triangle Overlap Test
// additionaly computes the segment of intersection of the two triangles if it exists. 
// coplanar returns whether the triangles are coplanar, 
// source and target are the endpoints of the line segment of intersection 
int tri_tri_intersection_test_3d(double p1[3], double q1[3], double r1[3], 
                           double p2[3], double q2[3], double r2[3],
                           int * coplanar, 
                           double source[3],double target[3]);


int coplanar_tri_tri3d(double  p1[3], double  q1[3], double  r1[3],
     double  p2[3], double  q2[3], double  r2[3],
     double  N1[3]);


// Two dimensional Triangle-Triangle Overlap Test
int tri_tri_overlap_test_2d(double p1[2], double q1[2], double r1[2], 
    double p2[2], double q2[2], double r2[2]);

#ifdef __cplusplus
}
#endif

#endif
