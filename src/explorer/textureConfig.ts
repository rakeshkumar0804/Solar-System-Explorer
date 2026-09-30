import * as THREE from 'three';

export const SUN_DIRECTION = new THREE.Vector3(-4.5, 1.8, 3).normalize();

/** Three textures are imperative GPU resources; configure them after loading. */
export function configureTexture(texture: THREE.Texture, colour: boolean, anisotropy = 4) {
  texture.colorSpace = colour ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  texture.anisotropy = anisotropy;
  texture.wrapS = THREE.RepeatWrapping;
  texture.needsUpdate = true;
}
