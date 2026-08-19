import * as THREE from 'three';

const textureCache = new Map<string, THREE.CanvasTexture>();

function addNoise(ctx: CanvasRenderingContext2D, width: number, height: number, density: number, opacity: number) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    if (Math.random() < density) {
      const noise = (Math.random() - 0.5) * opacity * 255;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

export function getCircularParticleTexture(): THREE.CanvasTexture {
  if (textureCache.has('circular_particle')) {
    return textureCache.get('circular_particle')!;
  }
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
  gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.2)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  textureCache.set('circular_particle', texture);
  return texture;
}

export function getProceduralTexture(type: string): THREE.CanvasTexture {
  if (textureCache.has(type)) {
    return textureCache.get(type)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  switch (type) {
    case 'sun': {
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, '#ff7700');
      grad.addColorStop(0.3, '#ffaa00');
      grad.addColorStop(0.5, '#fff2a8');
      grad.addColorStop(0.7, '#ff8800');
      grad.addColorStop(1, '#ff4400');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < 300; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const r = Math.random() * 50 + 10;
        const radGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
        radGrad.addColorStop(0, 'rgba(255, 255, 220, 0.6)');
        radGrad.addColorStop(0.5, 'rgba(255, 140, 0, 0.3)');
        radGrad.addColorStop(1, 'rgba(200, 50, 0, 0)');
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      addNoise(ctx, canvas.width, canvas.height, 0.4, 0.2);
      break;
    }

    case 'mercury': {
      ctx.fillStyle = '#8c8680';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < 400; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const r = Math.random() * 18 + 2;
        const craterGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
        craterGrad.addColorStop(0, '#52525b');
        craterGrad.addColorStop(0.7, '#71717a');
        craterGrad.addColorStop(0.9, '#a1a1aa');
        craterGrad.addColorStop(1, 'rgba(140, 134, 128, 0)');
        ctx.fillStyle = craterGrad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      addNoise(ctx, canvas.width, canvas.height, 0.5, 0.25);
      break;
    }

    case 'venus': {
      const vGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      vGrad.addColorStop(0, '#d97706');
      vGrad.addColorStop(0.25, '#fbbf24');
      vGrad.addColorStop(0.5, '#f59e0b');
      vGrad.addColorStop(0.75, '#d97706');
      vGrad.addColorStop(1, '#b45309');
      ctx.fillStyle = vGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < 50; i++) {
        ctx.strokeStyle = 'rgba(254, 243, 199, 0.2)';
        ctx.lineWidth = Math.random() * 25 + 8;
        const y = Math.random() * canvas.height;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(
          canvas.width * 0.33, y + (Math.random() - 0.5) * 40,
          canvas.width * 0.66, y + (Math.random() - 0.5) * 40,
          canvas.width, y
        );
        ctx.stroke();
      }
      addNoise(ctx, canvas.width, canvas.height, 0.25, 0.1);
      break;
    }

    case 'earth': {
      ctx.fillStyle = '#0f3a5d';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Continents
      ctx.fillStyle = '#226330';
      for (let i = 0; i < 40; i++) {
        const cx = Math.random() * canvas.width;
        const cy = canvas.height * 0.2 + Math.random() * canvas.height * 0.6;
        ctx.beginPath();
        ctx.arc(cx, cy, Math.random() * 90 + 30, 0, Math.PI * 2);
        ctx.fill();
        for (let j = 0; j < 6; j++) {
          ctx.beginPath();
          ctx.arc(cx + (Math.random() - 0.5) * 100, cy + (Math.random() - 0.5) * 70, Math.random() * 50 + 15, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Deserts
      ctx.fillStyle = '#a16207';
      for (let i = 0; i < 15; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, canvas.height * 0.35 + Math.random() * canvas.height * 0.3, Math.random() * 40 + 15, 0, Math.PI * 2);
        ctx.fill();
      }

      // Polar Ice
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height * 0.08);
      ctx.fillRect(0, canvas.height * 0.92, canvas.width, canvas.height * 0.08);

      // Clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      for (let i = 0; i < 30; i++) {
        const y = Math.random() * canvas.height;
        ctx.beginPath();
        ctx.ellipse(Math.random() * canvas.width, y, Math.random() * 120 + 40, Math.random() * 25 + 8, Math.random() * 0.4 - 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'moon': {
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#64748b';
      for (let i = 0; i < 15; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 90 + 30, 0, Math.PI * 2);
        ctx.fill();
      }
      addNoise(ctx, canvas.width, canvas.height, 0.45, 0.25);
      break;
    }

    case 'mars': {
      const mGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      mGrad.addColorStop(0, '#c2410c');
      mGrad.addColorStop(0.3, '#ea580c');
      mGrad.addColorStop(0.5, '#9a3412');
      mGrad.addColorStop(0.7, '#c2410c');
      mGrad.addColorStop(1, '#7c2d12');
      ctx.fillStyle = mGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = 'rgba(67, 20, 7, 0.4)';
      for (let i = 0; i < 30; i++) {
        ctx.beginPath();
        ctx.ellipse(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 110 + 30, Math.random() * 50 + 15, Math.random() * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      // Polar Ice
      ctx.fillStyle = '#fef2f2';
      ctx.fillRect(0, 0, canvas.width, canvas.height * 0.05);
      ctx.fillRect(0, canvas.height * 0.95, canvas.width, canvas.height * 0.05);
      addNoise(ctx, canvas.width, canvas.height, 0.3, 0.2);
      break;
    }

    case 'jupiter': {
      const bands = [
        '#8c5e3c', '#d4a373', '#e9c46a', '#a66a38', '#fefae0', '#bc6c25',
        '#dda15e', '#603813', '#c98a58', '#f4ebd0', '#8b5a2b', '#d29054'
      ];
      const bandHeight = canvas.height / bands.length;
      for (let i = 0; i < bands.length; i++) {
        ctx.fillStyle = bands[i];
        ctx.fillRect(0, i * bandHeight, canvas.width, bandHeight);
      }

      // Great Red Spot
      const spotX = canvas.width * 0.6;
      const spotY = canvas.height * 0.65;
      const spotGrad = ctx.createRadialGradient(spotX, spotY, 5, spotX, spotY, 55);
      spotGrad.addColorStop(0, '#991b1b');
      spotGrad.addColorStop(0.6, '#b91c1c');
      spotGrad.addColorStop(1, 'rgba(185, 28, 28, 0)');
      ctx.fillStyle = spotGrad;
      ctx.beginPath();
      ctx.ellipse(spotX, spotY, 65, 38, 0, 0, Math.PI * 2);
      ctx.fill();

      for (let i = 0; i < 40; i++) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = Math.random() * 8 + 2;
        const y = Math.random() * canvas.height;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(
          canvas.width * 0.3, y + (Math.random() - 0.5) * 25,
          canvas.width * 0.7, y + (Math.random() - 0.5) * 25,
          canvas.width, y
        );
        ctx.stroke();
      }
      addNoise(ctx, canvas.width, canvas.height, 0.25, 0.12);
      break;
    }

    case 'saturn': {
      const sGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      sGrad.addColorStop(0, '#caba94');
      sGrad.addColorStop(0.2, '#e2d4a8');
      sGrad.addColorStop(0.4, '#d8c292');
      sGrad.addColorStop(0.6, '#ebdcb2');
      sGrad.addColorStop(0.8, '#caa96e');
      sGrad.addColorStop(1, '#b59760');
      ctx.fillStyle = sGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < 30; i++) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = Math.random() * 10 + 2;
        const y = Math.random() * canvas.height;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      addNoise(ctx, canvas.width, canvas.height, 0.2, 0.08);
      break;
    }

    case 'uranus': {
      const uGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      uGrad.addColorStop(0, '#a5f3fc');
      uGrad.addColorStop(0.5, '#38bdf8');
      uGrad.addColorStop(1, '#0284c7');
      ctx.fillStyle = uGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      addNoise(ctx, canvas.width, canvas.height, 0.15, 0.05);
      break;
    }

    case 'neptune': {
      const nGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      nGrad.addColorStop(0, '#1d4ed8');
      nGrad.addColorStop(0.4, '#2563eb');
      nGrad.addColorStop(0.7, '#1e40af');
      nGrad.addColorStop(1, '#172554');
      ctx.fillStyle = nGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dark spot
      const dsX = canvas.width * 0.45;
      const dsY = canvas.height * 0.4;
      const dsGrad = ctx.createRadialGradient(dsX, dsY, 2, dsX, dsY, 40);
      dsGrad.addColorStop(0, '#0f172a');
      dsGrad.addColorStop(0.8, '#1e3a8a');
      dsGrad.addColorStop(1, 'rgba(30, 58, 138, 0)');
      ctx.fillStyle = dsGrad;
      ctx.beginPath();
      ctx.ellipse(dsX, dsY, 50, 25, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cirrus clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      for (let i = 0; i < 15; i++) {
        ctx.beginPath();
        ctx.ellipse(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 80 + 30, Math.random() * 10 + 3, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'pluto': {
      ctx.fillStyle = '#bfa58a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Tombaugh Regio
      ctx.fillStyle = '#f1e6d4';
      ctx.beginPath();
      ctx.arc(canvas.width * 0.5, canvas.height * 0.5, 75, 0, Math.PI * 2);
      ctx.fill();
      addNoise(ctx, canvas.width, canvas.height, 0.35, 0.2);
      break;
    }

    default: {
      ctx.fillStyle = '#71717a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      addNoise(ctx, canvas.width, canvas.height, 0.3, 0.2);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = true;
  textureCache.set(type, texture);
  return texture;
}

export function getRingTexture(type: 'saturn' | 'uranus'): THREE.CanvasTexture {
  const cacheKey = 'ring_' + type;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);

  if (type === 'saturn') {
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(0.1, 'rgba(180, 150, 110, 0.4)');
    gradient.addColorStop(0.35, 'rgba(225, 205, 160, 0.9)');
    gradient.addColorStop(0.55, 'rgba(210, 190, 140, 0.85)');
    gradient.addColorStop(0.62, 'rgba(0, 0, 0, 0.05)');
    gradient.addColorStop(0.68, 'rgba(0, 0, 0, 0.05)');
    gradient.addColorStop(0.72, 'rgba(195, 175, 130, 0.8)');
    gradient.addColorStop(0.95, 'rgba(160, 140, 100, 0.4)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
  } else {
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(0.3, 'rgba(165, 243, 252, 0.15)');
    gradient.addColorStop(0.6, 'rgba(56, 189, 248, 0.6)');
    gradient.addColorStop(0.8, 'rgba(14, 165, 233, 0.3)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
  }

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  textureCache.set(cacheKey, texture);
  return texture;
}
