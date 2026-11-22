import React from 'react';

interface WordmarkProps {
  size?: 'sm' | 'lg';
}

export const Wordmark: React.FC<WordmarkProps> = ({ size = 'sm' }) => {
  if (size === 'lg') {
    return (
      <div className="inline-flex flex-col items-center select-none">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-950 flex items-center justify-center shadow-sm">
            <svg viewBox="0 0 32 32" className="w-6 h-6" fill="currentColor" aria-hidden="true">
              <path d="M9 24.5h14v2H9v-2zm1.5-2L11.8 16l-3-1.4-.6-3.2 4-4.6 2.5.4 1.8-2.2 1.8 3c2.8 1.5 3.9 5.5 3 10.2l-.7 4.3h-10.1z" />
            </svg>
          </div>
          <span className="font-serif text-4xl sm:text-5xl tracking-tight text-zinc-950 dark:text-zinc-50">
            Open<span className="italic opacity-75">Chess</span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      <div className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-950 flex items-center justify-center transition-transform group-hover:scale-105">
        <svg viewBox="0 0 32 32" className="w-4 h-4" fill="currentColor" aria-hidden="true">
          <path d="M9 24.5h14v2H9v-2zm1.5-2L11.8 16l-3-1.4-.6-3.2 4-4.6 2.5.4 1.8-2.2 1.8 3c2.8 1.5 3.9 5.5 3 10.2l-.7 4.3h-10.1z" />
        </svg>
      </div>
      <span className="font-serif text-xl sm:text-2xl tracking-tight text-zinc-950 dark:text-zinc-50">
        Open<span className="italic opacity-75">Chess</span>
      </span>
    </div>
  );
};
