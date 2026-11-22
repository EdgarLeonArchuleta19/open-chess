import React, { useEffect, useRef } from 'react';
import type { AppTheme } from '../../features/chess/types/chess.types';

interface SquaresBackgroundProps {
  theme: AppTheme;
  squareSize?: number;
  speed?: number;
}

/**
 * React Bits-inspired interactive moving chessboard grid background (`Squares`).
 * Smooth 60fps HTML5 canvas that drifts subtly and illuminates squares under the cursor.
 */
export const SquaresBackground: React.FC<SquaresBackgroundProps> = ({
  theme,
  squareSize = 52,
  speed = 0.25,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hoveredSquareRef = useRef<{ x: number; y: number } | null>(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.clientWidth || window.innerWidth;
      const height = canvas.clientHeight || window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (mouseX < 0 || mouseY < 0 || mouseX > rect.width || mouseY > rect.height) {
        hoveredSquareRef.current = null;
        return;
      }

      const startX = Math.floor(offsetRef.current.x / squareSize) * squareSize;
      const startY = Math.floor(offsetRef.current.y / squareSize) * squareSize;

      const hoveredX = Math.floor((mouseX + offsetRef.current.x - startX) / squareSize);
      const hoveredY = Math.floor((mouseY + offsetRef.current.y - startY) / squareSize);
      hoveredSquareRef.current = { x: hoveredX, y: hoveredY };
    };

    const handleMouseLeave = () => {
      hoveredSquareRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const isDark = theme === 'dark';
    const borderColor = isDark ? 'rgba(255, 255, 255, 0.045)' : 'rgba(9, 9, 11, 0.055)';
    const hoverFill = isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(9, 9, 11, 0.06)';
    const vignetteEdge = isDark ? 'rgba(10, 11, 14, 0.96)' : 'rgba(247, 247, 245, 0.95)';

    const draw = () => {
      const width = canvas.clientWidth || window.innerWidth;
      const height = canvas.clientHeight || window.innerHeight;

      ctx.clearRect(0, 0, width, height);

      offsetRef.current.x = (offsetRef.current.x + speed) % squareSize;
      offsetRef.current.y = (offsetRef.current.y + speed) % squareSize;

      const startX = Math.floor(offsetRef.current.x / squareSize) * squareSize;
      const startY = Math.floor(offsetRef.current.y / squareSize) * squareSize;

      for (let x = startX; x < width + squareSize; x += squareSize) {
        for (let y = startY; y < height + squareSize; y += squareSize) {
          const squareX = x - (offsetRef.current.x % squareSize);
          const squareY = y - (offsetRef.current.y % squareSize);

          const gridX = Math.floor((x - startX) / squareSize);
          const gridY = Math.floor((y - startY) / squareSize);

          if (
            hoveredSquareRef.current &&
            hoveredSquareRef.current.x === gridX &&
            hoveredSquareRef.current.y === gridY
          ) {
            ctx.fillStyle = hoverFill;
            ctx.fillRect(squareX, squareY, squareSize, squareSize);
          }

          ctx.strokeStyle = borderColor;
          ctx.lineWidth = 1;
          ctx.strokeRect(squareX, squareY, squareSize, squareSize);
        }
      }

      // Soft radial vignette so edges fade seamlessly into the page background
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) * 0.12,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.72
      );
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(1, vignetteEdge);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      animationFrameId = window.requestAnimationFrame(draw);
    };

    animationFrameId = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [theme, squareSize, speed]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 w-full h-full z-0"
    />
  );
};
