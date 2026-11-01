import React from 'react';
import { LuMonitor, LuMoon, LuSun } from 'react-icons/lu';
import type { ThemePreference } from '../hooks/useTheme';

interface HeaderProps {
  online: boolean | null;
  theme: ThemePreference;
  onCycleTheme: () => void;
}

const THEME_ICON = { system: LuMonitor, light: LuSun, dark: LuMoon };
const NEXT_THEME = { system: 'light', light: 'dark', dark: 'system' };

const Header: React.FC<HeaderProps> = ({ online, theme, onCycleTheme }) => {
  const ThemeIcon = THEME_ICON[theme];

  return (
    <header className='sticky top-0 z-10 border-b border-line/70 bg-bg/80 backdrop-blur-md'>
      <div className='mx-auto flex h-14 max-w-3xl items-center justify-between px-4'>
        <div className='flex items-center gap-2.5'>
          <img src='/keyboard.svg' alt='' className='size-7' />
          <div className='leading-tight'>
            <p className='text-sm font-semibold tracking-tight text-fg'>Text Predictor</p>
            <p className='font-mono text-[11px] text-fg-3'>n-gram · wikitext-103</p>
          </div>
        </div>

        <div className='flex items-center gap-1'>
          {online !== null && (
            <span
              className='mr-1 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-fg-2'
              role='status'
            >
              <span
                aria-hidden
                className={`size-1.5 rounded-full ${online ? 'bg-ok shadow-[0_0_0_3px_color-mix(in_oklab,var(--ok)_20%,transparent)]' : 'bg-critical'}`}
              />
              {online ? 'Model online' : 'Offline'}
            </span>
          )}
          <button
            type='button'
            onClick={onCycleTheme}
            aria-label={`Theme: ${theme}. Switch to ${NEXT_THEME[theme]}`}
            title={`Theme: ${theme}`}
            className='flex size-8 items-center justify-center rounded-lg text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg'
          >
            <ThemeIcon className='size-4' aria-hidden />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
