import React from 'react';

interface PanelProps {
  title: string;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}

const Panel: React.FC<PanelProps> = ({ title, subtitle, action, children }) => (
  <section className='flex flex-col rounded-2xl border border-line bg-surface p-5 sm:p-6 xl:min-h-0 xl:overflow-y-auto xl:p-5 xl:[scrollbar-width:thin]'>
    <header className='mb-5 flex xl:mb-4 items-start justify-between gap-3'>
      <div>
        <h2 className='text-sm font-semibold tracking-tight text-fg'>{title}</h2>
        {subtitle && <p className='mt-0.5 text-xs text-fg-3'>{subtitle}</p>}
      </div>
      {action}
    </header>
    {children}
  </section>
);

export default Panel;
