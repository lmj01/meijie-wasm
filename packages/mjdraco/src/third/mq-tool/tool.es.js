class MqRaycast {
  constructor(lib3, viewer) {
    this.lib3 = lib3;
    this.viewer = viewer;
    this.raycast = new lib3.Raycaster();
  }
  pickMesh(pt, targets, camera, options = {}) {
    let recursive = true;
    if (typeof options.recursive) recursive = options.recursive;
    this.raycast.setFromCamera(pt, camera);
    const intersects = this.raycast.intersectObjects(targets, recursive);
    return intersects[0];
  }
}
const cache = {
  sphere: [],
  radius: [],
  mat: void 0
};
function createMarkSphere(lib3, options = {}) {
  let geo, radius = options.sphereRadius || 0.75;
  let idx = cache.radius.indexOf(radius);
  if (idx < 0) {
    geo = new lib3.SphereGeometry(radius, 32, 32);
    cache.sphere.push(geo);
    cache.radius.push(radius);
  } else {
    geo = cache.sphere[idx];
  }
  if (!geo) throw new Error(`cache with some wrong ${idx}`);
  if (!cache.mat) cache.mat = new lib3.MeshLambertMaterial({ color: 16711680 });
  const mark = new lib3.Mesh(geo, cache.mat);
  mark.name = options.name || `mark_sphere_${Date.now()}`;
  if (options.point) {
    if (options.point.isVector3) {
      mark.position.copy(options.point);
    } else if (Array.isArray(options.point)) {
      mark.position.fromArray(options.point);
    }
  }
  if (options.mat) {
    mark.applayMatrix4(options.mat);
    mark.updateMatrix();
  }
  return mark;
}
export {
  MqRaycast,
  createMarkSphere
};
