import React, { useCallback, useRef } from 'react';

interface ClickSparkProps {
  children: React.ReactNode;
  sparkColor?: string;
  sparkCount?: number;
  sparkRadius?: number;
}

/**
 * React Bits-inspired `ClickSpark` wrapper.
 * Emits crisp, ultra-minimal geometric micro-sparks on pointer click.
 */
export const ClickSpark: React.FC<ClickSparkProps> = ({
  children,
  sparkColor = 'currentColor',
  sparkCount = 8,
  sparkRadius = 22,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const burst = document.createElement('div');
      burst.style.position = 'fixed';
      burst.style.left = `${e.clientX}px`;
      burst.style.top = `${e.clientY}px`;
      burst.style.pointerEvents = 'none';
      burst.style.zIndex = '9999';
      burst.style.color =
        sparkColor === 'currentColor'
          ? document.documentElement.classList.contains('dark')
            ? 'rgba(244,244,245,0.65)'
            : 'rgba(24,24,27,0.55)'
          : sparkColor;

      // Unused local coords avoided; fixed viewport coordinates ensure sparks align on scroll
      void x;
      void y;

      for (let i = 0; i < sparkCount; i++) {
        const angle = (2 * Math.PI * i) / sparkCount;
        const line = document.createElement('span');
        line.style.position = 'absolute';
        line.style.left = '0';
        line.style.top = '0';
        line.style.width = '7px';
        line.style.height = '1.5px';
        line.style.borderRadius = '9999px';
        line.style.backgroundColor = 'currentColor';
        line.style.transformOrigin = 'left center';
        line.style.transform = `rotate(${angle}rad) translateX(4px)`;
        line.style.opacity = '1';
        line.style.transition =
          'transform 340ms cubic-bezier(0.22, 1, 0.36, 1), opacity 340ms ease-out';

        burst.appendChild(line);

        requestAnimationFrame(() => {
          line.style.transform = `rotate(${angle}rad) translateX(${sparkRadius}px) scaleX(0.3)`;
          line.style.opacity = '0';
        });
      }

      document.body.appendChild(burst);
      window.setTimeout(() => {
        burst.remove();
      }, 360);
    },
    [sparkColor, sparkCount, sparkRadius]
  );

  return (
    <div ref={containerRef} onClick={handleClick} className="contents">
      {children}
    </div>
  );
};
