import React from 'react';

const Kbd: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd className='inline-flex h-5 min-w-5 items-center justify-center rounded-[5px] border border-line bg-surface-2 px-1.5 font-mono text-[10px] leading-none font-medium whitespace-nowrap text-fg-3 shadow-[inset_0_-1px_0_var(--line)]'>
    {children}
  </kbd>
);

export default Kbd;
