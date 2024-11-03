import { randomNumber } from "../../utils";

// Types and utility functions for preloader backdrop canvas computations.
export type COORDS = { x: number; y: number; dx: number; dy: number };

// Radius of each point to draw.
const radius = 5;

const isMobile = () => {
  return window.matchMedia("(max-width: 576px)").matches;
};

// Generate points placed randomly within the canvas bounds.
export const createPoints = (canvas: HTMLCanvasElement): COORDS[] => {
  return [...Array(isMobile() ? 35 : 75).keys()].map(() => ({
    x: randomNumber() * canvas.width,
    y: randomNumber() * canvas.height,
    dx: (randomNumber() - 0.5) * 2,
    dy: (randomNumber() - 0.5) * 2,
  }));
};

// Update the coordinates of all points while maintaining them within canvas bounds.
export const updatePoints = (
  points: COORDS[],
  boundary: { w: number; h: number }
): COORDS[] => {
  return points.map((pt) => {
    let dx = pt.x < radius || pt.x > boundary.w - radius ? -pt.dx : pt.dx;
    let dy = pt.y < radius || pt.y > boundary.h - radius ? -pt.dy : pt.dy;
    return { x: pt.x + dx, y: pt.y + dy, dx, dy };
  });
};

// Calculate distance between points.
export const distance = (p1: COORDS, p2: COORDS) => {
  let dx = p2.x - p1.x;
  let dy = p2.y - p1.y;
  return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
};

// Draw everything on the canvas, lines followd by points.
export const drawBackdrop = (
  points: COORDS[],
  ctx: CanvasRenderingContext2D
) => {
  ctx.beginPath();
  for (const sp of points) {
    ctx.moveTo(sp.x, sp.y);
    for (const tp of points) if (distance(sp, tp) < 130) ctx.lineTo(tp.x, tp.y);
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
