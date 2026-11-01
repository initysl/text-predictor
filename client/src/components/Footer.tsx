import React from 'react';
import { FaGithub } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

const LINKS = [
  { href: 'https://github.com/initysl/text-predictor', label: 'Source on GitHub', Icon: FaGithub },
  { href: 'https://x.com/initysl', label: 'initysl on X', Icon: FaXTwitter },
];

const Footer: React.FC = () => (
  <footer className='border-t border-line/70'>
    <div className='mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-6 text-xs text-fg-3'>
      <p>Trained on WikiText-103 · 100M tokens of Wikipedia</p>
      <div className='flex items-center gap-1'>
        {LINKS.map(({ href, label, Icon }) => (
          <a
            key={href}
            href={href}
            target='_blank'
            rel='noopener noreferrer'
            aria-label={label}
            className='flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-surface-2 hover:text-fg'
          >
            <Icon className='size-4' aria-hidden />
          </a>
        ))}
      </div>
    </div>
  </footer>
);

export default Footer;
