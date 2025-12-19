// Directly copied siriwave.js, and reimplemented into functional style

import { throttle } from 'es-toolkit';
import { useLayoutEffect, useRef, useState } from 'react';
import { useResponsiveIsGreaterThan } from '@/hooks/useResponsive';

interface CurveState {
  phase: number;
  offset: number;
  speed: number;
  finalAmp: number;
  width: number;
  amp: number;
  despawnTimeout: number;
  verse: number;
}

type Options = {
  ctx: CanvasRenderingContext2D;
  amplitude: number;
  width: number;
  height: number;
  speed: number;
  pixelDepth: number;
};

type CurveDefinition = {
  color: string;
  supportLine?: boolean;
};

const DEFINITIONS: CurveDefinition[] = [
  {
    color: '255, 255, 255',
    supportLine: true,
  },
  { color: '15, 82, 169' },
  { color: '173, 57, 76' },
  { color: '48, 220, 155' },
];

const RANGES = {
  curves: [2, 5],
  amp: [0.3, 1],
  offset: [-3, 3],
  width: [1, 3],
  speed: [0.5, 1],
  timeout: [500, 2000],
} as const;

const getRandomRange = ([min, max]: readonly [number, number]) => min + Math.random() * (max - min);
const globalAttFn = (x: number) => Math.pow(4 / (4 + Math.pow(x, 2)), 4);
const createSingleSiriWave = (definition: CurveDefinition, opts: Options) => {
  let curves: CurveState[] = [];
  let spawnAt = 0;
  let prevMaxY = 0;

  const spawn = () => {
    spawnAt = Date.now();
    curves = Array.from({ length: Math.floor(getRandomRange(RANGES.curves)) }).map(() => ({
      phase: 0,
      amp: 0,
      despawnTimeout: getRandomRange(RANGES.timeout),
      offset: getRandomRange(RANGES.offset),
      speed: getRandomRange(RANGES.speed),
      finalAmp: getRandomRange(RANGES.amp),
      width: getRandomRange(RANGES.width),
      verse: getRandomRange([-1, 1]),
    }));
  };

  const maxHeight = opts.height / 2 - 6;

  const getY = (i: number) => {
    const val = curves.reduce((acc, c, idx) => {
      const t = 4 * (-1 + (idx / (curves.length - 1)) * 2) + c.offset;
      const x = i * (1 / c.width) - t;
      return acc + Math.abs(c.amp * Math.sin(c.verse * x - c.phase) * globalAttFn(x));
    }, 0);

    return 0.8 * maxHeight * opts.amplitude * (val / curves.length) * globalAttFn((i / 25) * 2);
  };

  return () => {
    const { ctx } = opts;
    ctx.globalAlpha = 0.7;
    ctx.globalCompositeOperation = 'lighter';

    if (definition.supportLine) {
      const grad = ctx.createLinearGradient(0, maxHeight, opts.width, 1);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.1, 'rgba(255,255,255,.5)');
      grad.addColorStop(0.8, 'rgba(255,255,255,.5)');
      grad.addColorStop(1, 'transparent');

      ctx.fillStyle = grad;
      ctx.fillRect(0, maxHeight, opts.width, 1);
      return;
    }

    if (spawnAt === 0) {
      spawn();
    }

    curves.forEach(c => {
      c.amp += spawnAt + c.despawnTimeout <= Date.now() ? -0.02 : 0.02;
      c.amp = Math.min(Math.max(c.amp, 0), c.finalAmp);
      c.phase = (c.phase + opts.speed * c.speed) % (2 * Math.PI);
    });

    let maxY = -Infinity;
    const color = definition.color;

    [1, -1].forEach(sign => {
      ctx.beginPath();

      for (let i = -25; i <= 25; i += opts.pixelDepth) {
        const x = opts.width * ((i + 25) / 50);
        const y = getY(i);
        ctx.lineTo(x, maxHeight - sign * y);
        maxY = Math.max(maxY, y);
      }

      ctx.closePath();
      ctx.fillStyle = `rgba(${color}, 1)`;
      ctx.strokeStyle = `rgba(${color}, 1)`;
      ctx.fill();
    });

    if (maxY < 2 && prevMaxY > maxY) {
      spawnAt = 0;
    }

    prevMaxY = maxY;
  };
};

const createSiriWaveRenderFn = (opts: Options) => {
  const curves = DEFINITIONS.map(definition => createSingleSiriWave(definition, opts));

  return () => {
    opts.ctx.globalCompositeOperation = 'destination-out';
    opts.ctx.fillRect(0, 0, opts.width, opts.height);
    curves.forEach(curve => curve());
  };
};

export const SiriWave = () => {
  const [width, setWidth] = useState(() => window.innerWidth);

  useLayoutEffect(() => {
    const onResize = throttle(() => setWidth(window.innerWidth), 150);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isDesktop = useResponsiveIsGreaterThan(768);
  const height = isDesktop ? 400 : 300;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useLayoutEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) {
      return () => {};
    }

    const render = createSiriWaveRenderFn({
      ctx,
      width,
      height,
      amplitude: 1,
      speed: 0.1,
      pixelDepth: 0.5,
    });

    let rafId: number;
    const onRender = () => {
      render();
      rafId = requestAnimationFrame(onRender);
    };

    onRender();
    return () => cancelAnimationFrame(rafId);
  }, [width]);

  return <canvas ref={canvasRef} width={width} height={`${height}px`} style={{ width: '100%' }} />;
};
