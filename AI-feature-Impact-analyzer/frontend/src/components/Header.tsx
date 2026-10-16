import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="w-full border-b border-surface-border bg-surface-bg px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">
          AI Feature Impact Analyzer
        </h1>
        <p className="text-xs text-muted-slate font-medium mt-0.5">
          Portfolio Health & Unit Economics
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-slate font-mono">
          Executive Portfolio View
        </span>
      </div>
    </header>
  );
};
