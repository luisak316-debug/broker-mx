import * as THREE from 'three';

function landValue(lat: number, lon: number): number {
  return (
    Math.sin(lon * 2.4 + 0.8) * Math.cos(lat * 3.1) +
    Math.sin(lon * 5.2 - 1.2) * 0.45 +
    Math.cos(lat * 1.8 + lon * 0.6) * 0.28
  );
}

export function buildGlobePoints(radius: number, latSegments = 112, lonSegments = 224) {
  const positions: number[] = [];
  const colors: number[] = [];
  const sizes: number[] = [];
  const lands: number[] = [];

  for (let latI = 0; latI <= latSegments; latI++) {
    const v = latI / latSegments;
    const phi = v * Math.PI;
    const y = Math.cos(phi);
    const ring = Math.sin(phi);

    for (let lonI = 0; lonI <= lonSegments; lonI++) {
      const theta = (lonI / lonSegments) * Math.PI * 2;
      const x = Math.cos(theta) * ring;
      const z = Math.sin(theta) * ring;

      const lat = Math.asin(Math.max(-1, Math.min(1, y)));
      const lv = landValue(lat, theta);
      const lit = lv > 0.08;
      const tier = lv > 0.52 ? 2 : lv > 0.2 ? 1 : 0;

      positions.push(x * radius, y * radius, z * radius);
      lands.push(lit ? 1 : 0);

      if (lit) {
        if (tier === 2) {
          colors.push(1.0, 0.82, 0.45);
          sizes.push(4.8);
        } else if (tier === 1) {
          colors.push(1.0, 0.72, 0.34);
          sizes.push(3.8);
        } else {
          colors.push(0.88, 0.62, 0.36);
          sizes.push(3.0);
        }
      } else {
        colors.push(0.12, 0.1, 0.18);
        sizes.push(2.2);
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
  geometry.setAttribute('land', new THREE.Float32BufferAttribute(lands, 1));

  return geometry;
}

export const globeVertexShader = /* glsl */ `
  attribute float size;
  attribute float land;
  attribute vec3 color;
  varying vec3 vColor;
  varying float vLand;
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    vColor = color;
    vLand = land;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * position);
    vView = normalize(-mvPosition.xyz);
    float perspective = 420.0 / -mvPosition.z;
    gl_PointSize = size * perspective;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const globeFragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vLand;
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float dist = length(uv);
    if (dist > 0.5) discard;

    float ndv = max(dot(normalize(vNormal), normalize(vView)), 0.0);
    float fresnel = pow(1.0 - ndv, 2.6);

    vec3 ocean = vColor * (0.55 + fresnel * 0.35);
    vec3 landGlow = vColor * 2.4 + vec3(1.0, 0.86, 0.5) * 0.55;
    vec3 base = mix(ocean, landGlow, vLand);

    float horizon = smoothstep(0.35, 0.95, 1.0 - abs(vNormal.y));
    base += vec3(1.0, 0.92, 0.62) * horizon * fresnel * 0.65;

    float core = smoothstep(0.5, 0.0, dist);
    float alpha = core * (vLand > 0.5 ? 0.95 : 0.72);
    gl_FragColor = vec4(base, alpha);
  }
`;

export function buildHorizonRings(radius: number) {
  const core = new THREE.TorusGeometry(radius, 0.018, 12, 256);
  const glow = new THREE.TorusGeometry(radius, 0.055, 12, 256);

  const coreMat = new THREE.MeshBasicMaterial({
    color: 0xfff4dc,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xffc870,
    transparent: true,
    opacity: 0.28,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const coreMesh = new THREE.Mesh(core, coreMat);
  const glowMesh = new THREE.Mesh(glow, glowMat);
  coreMesh.rotation.x = Math.PI / 2;
  glowMesh.rotation.x = Math.PI / 2;

  const group = new THREE.Group();
  group.add(glowMesh);
  group.add(coreMesh);
  return { group, coreMat, glowMat, core, glow };
}
