// Types and utility functions for preloader backdrop canvas computations.
export type COORDS = { x: number; y: number; dx: number; dy: number };

// Generate points placed randomly within the canvas bounds.
export const createPoints = (canvas: HTMLCanvasElement): COORDS[] => {
  const isMobile = window.matchMedia("(max-width: 576px)").matches;
  return [...Array(isMobile ? 35 : 75).keys()].map(() => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    dx: (Math.random() - 0.5) * 2,
    dy: (Math.random() - 0.5) * 2,
  }));
};

// Update the coordinates of all points while maintaining them within canvas bounds.
export const updatePoints = (
  points: COORDS[],
  bounds: [number, number]
): COORDS[] => {
  return points.map((point) => {
    let dx = point.x < 10 || point.x > bounds[0] - 10 ? -point.dx : point.dx;
    let dy = point.y < 10 || point.y > bounds[1] - 10 ? -point.dy : point.dy;
    return { x: point.x + dx, y: point.y + dy, dx, dy };
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
    for (const tp of points) if (distance(sp, tp) < 150) ctx.lineTo(tp.x, tp.y);
  }
  ctx.stroke();

  for (const p of points) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 10, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.stroke();
  }
};
