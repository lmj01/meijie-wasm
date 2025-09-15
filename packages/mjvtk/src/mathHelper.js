
// 计算累积弧长
function calculateCumulativeLength(points) {
    const lengths = [0]  // 第一个点的累积长度为0
    let totalLength = 0
    for (let i = 1; i < points.length; i++) {
        const dx = points[i][0] - points[i-1][0]
        const dy = points[i][1] - points[i-1][1]
        const dz = points[i][2] - points[i-1][2]
        const segmentLength = Math.sqrt(dx*dx + dy*dy + dz*dz)
        totalLength += segmentLength
        lengths.push(totalLength)
    }
    return {lengths, totalLength}
}
// 根据弧长比例找到对应的点和插值系数
function findPointByArcLength(lengths, totalLength, ratio) {
    const targetLength = ratio * totalLength
    
    // 使用二分查找提高效率
    let left = 0
    let right = lengths.length - 1
    
    while (left < right) {
        const mid = Math.floor((left + right) / 2)
        if (lengths[mid] < targetLength) {
            left = mid + 1
        } else {
            right = mid
        }
    }
    
    const index1 = Math.max(0, left - 1)
    const index2 = Math.min(left, lengths.length - 1)
    
    let alpha = 0
    if (index1 !== index2 && lengths[index2] !== lengths[index1]) {
        alpha = (targetLength - lengths[index1]) / (lengths[index2] - lengths[index1])
    }
    
    return { index1, index2, alpha }
}
export function generateUniformCurve(originalPoints, numPoints) {
    if (originalPoints.length < 2) return originalPoints
    
    // 1. 计算原始曲线的累积弧长
    const { lengths, totalLength } = calculateCumulativeLength(originalPoints)
    
    // 2. 生成均匀分布的弧长参数
    const uniformCurve = []
    for (let i = 0; i < numPoints; i++) {
        
        // 3. 找到对应的点和插值系数
        const { index1, index2, alpha } = findPointByArcLength(lengths, totalLength, i / (numPoints - 1))
        
        // 4. 线性插值生成新点
        const point1 = originalPoints[index1]
        const point2 = originalPoints[index2]
        const newPoint = [
            point1[0] * (1 - alpha) + point2[0] * alpha,
            point1[1] * (1 - alpha) + point2[1] * alpha,
            point1[2] * (1 - alpha) + point2[2] * alpha
        ]
        uniformCurve.push(newPoint)
    }
    return uniformCurve
}
// 辅助函数
export function cross(a, b) {
  return [
    a[1]*b[2] - a[2]*b[1],
    a[2]*b[0] - a[0]*b[2],
    a[0]*b[1] - a[1]*b[0]
  ];
}

export function normalize(v) {
  const len = Math.sqrt(v[0]**2 + v[1]**2 + v[2]**2);
  if (len > 0) {
    v[0] /= len;
    v[1] /= len;
    v[2] /= len;
  }
  return v
}
