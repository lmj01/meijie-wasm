/* ---------------------------------------------------------------- */
/* This program illustrates the impact of loss of significant       */
/* digits.  It solves a quadratic equation x^2 + bx + c = 0 using   */
/* two different ways.  The first is the one you learned in your    */
/* algebra course, which the other tries to minimize the effect.    */
/* ---------------------------------------------------------------- */

/**
https://pages.mtu.edu/~shene/COURSES/cs3621/NOTES/overview/quad.c
*/

#include <math.h>
#include <stdio.h>
#include <stdlib.h>

#define TOL (1.0e-07)

int main(int argc, char *argv[]) {
  float a, b, c; /* input coefficients            */
  float p, q;    /* normalized coefficients       */
  float d;       /* discriminant                  */
  float r1, r2;  /* roots                         */

  if (argc != 4) {
    printf("Use %s a b c\n", argv[0]);
    printf("Since you did not supply anything, I will use\n"
           " a = 1, b = -20000 and c = 1.\n\n");
    a = 1.0;
    b = -20000.0;
    c = 1.0;
  } else {
    a = atof(argv[1]);
    b = atof(argv[2]);
    c = atof(argv[3]);
  }

  printf("Input equation: (%f)x^2 + (%f)x + (%f) = 0\n\n", a, b, c);
  if (a == 0.0) {
    printf("Coefficient a must not be zero\n");
    exit(1);
  }

  d = b * b - 4.0 * a * c;
  if (d < 0.0) {
    printf("Equation has complex roots\n");
    exit(1);
  }
  d = sqrt(d);
  r1 = (-b + d) / (a + a);
  r2 = (-b - d) / (a + a);
  printf("Roots by a naive method:\n\t%f and %f\n", r1, r2);

  /* ----------------------------------------------------------- */
  /* root = (-b +- sqrt(b^2-4ac))/(2a) is multiplied by          */
  /*    -b -+ sqrt(b^2-4ac)                                      */
  /*    -------------------                                      */
  /*    -b -+ sqrt(b^2-4ac)                                      */
  /* the roots are:                                              */
  /*           -2c                                               */
  /*    ------------------                                       */
  /*    b +- sqrt(b^2-4ac)                                       */
  /* thus, if b>0, + is chosen; otherwise, use -.  this makes    */
  /* sure that the denominator does not have subtraction!        */
  /* ----------------------------------------------------------- */

  d = sqrt(b * b - 4.0 * a * c);
  if (b > 0.0)
    r1 = -2.0 * c / (b + d);
  else
    r1 = -2.0 * c / (b - d);
  r2 = (c / a) / r1;
  printf("Roots by a less well-known formula:\n");
  printf("\t%f and %f\n", r1, r2);

  /* ----------------------------------------------------------- */
  /* The given equation is transformed to x^2+2px+q=0, where p   */
  /* and q are defined as b/(2a) and c/a respectively.  Then, the*/
  /* roots are (-p +- sqrt(p*p-q)).  To avoid using subtraction, */
  /* do the following:                                           */
  /*   if p > 0: in this case, -p<0. The '-' is chosen and a root*/
  /*             is -p-sqrt(p*p-q)                               */
  /*   if p < 0: in this case, -p>0. The '+' is chosen and a root*/
  /*             is -p+sqrt(p*p-q)                               */
  /* ----------------------------------------------------------- */

  p = b / a / 2.0;
  q = c / a;
  d = sqrt(p * p - q);
  if (p >= 0.0)
    r1 = (-p - d);
  else
    r1 = (-p + d);
  r2 = q / r1;
  printf("Roots by significant digits preserving method:\n");
  printf("\t%f and %f\n", r1, r2);
  return 0;
}
