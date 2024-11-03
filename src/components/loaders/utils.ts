import { randomNumber } from "../../utils";

// Types and utility functions for preloader backdrop canvas computations.
export type COORDS = { x: number; y: number; dx: number; dy: number };

// Radius of each point to draw.
const radius = 5;

// Generate points placed randomly within the canvas bounds.
export const createPoints = (canvas: HTMLCanvasElement): COORDS[] => {
  const isMobile = window.matchMedia("(max-width: 576px)").matches;
  return [...Array(isMobile ? 35 : 75).keys()].map(() => ({
    x: randomNumber() * canvas.width,
    y: randomNumber() * canvas.height,
    dx: (randomNumber() - 0.5) * 2,
    dy: (randomNumber() - 0.5) * 2,
  }));
};

// Update the coordinates of all points while maintaining them within canvas bounds.
export const updatePoints = (
  points: COORDS[],
  bounds: [number, number]
): COORDS[] => {
  return points.map((pt) => {
    let dx = pt.x < radius || pt.x > bounds[0] - radius ? -pt.dx : pt.dx;
    let dy = pt.y < radius || pt.y > bounds[1] - radius ? -pt.dy : pt.dy;
    return { x: pt.x + dx, y: pt.y + dy, dx, dy };
  });
};

// Calculate distance between points.
export const distance = (p1: COORDS, p2: COORDS) => {
  let dx = 0;
  let dy = 0;
  dx = p2.x - p1.x;
  dx = dx * dx;
  dy = p2.y - p1.y;
  dy = dy * dy;
  return Math.sqrt(dx + dy);
};

// Draw everything on the canvas, lines followd by points.
export const drawBackdrop = (
  points: COORDS[],
  ctx: CanvasRenderingContext2D
) => {
  ctx.beginPath();
  for (const sp of points) {
    ctx.moveTo(sp.x, sp.y);
    for (const tp of points) if (distance(sp, tp) < 125) ctx.lineTo(tp.x, tp.y);
  }
  ctx.stroke();

  for (const p of points) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2, false);
    ctx.fill();
  }
};

export const randomIncrememt = () => {
  return Math.floor((randomNumber() * Math.PI) / 1.6) + 0.07;
};
