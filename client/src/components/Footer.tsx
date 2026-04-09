import React from 'react';
import { BsGithub, BsX } from 'react-icons/bs';

const Footer: React.FC = () => {
  return (
    <footer className='bg-white border-t border-gray-200'>
      <div className='max-w-4xl mx-auto px-4 py-5 flex justify-center flex-col sm:flex-row items-center gap-3 text-sm text-gray-600'>
        <p>Trained on WikiText-103</p>

        <a
          href='https://github.com/initysl/text-predictor'
          target='_blank'
          rel='noopener noreferrer'
          className='flex items-center gap-2 hover:underline'
        >
          <BsGithub className='text-lg' />
        </a>

        <a
          href='https://x.com/initysl'
          target='_blank'
          rel='noopener noreferrer'
          className='flex items-center gap-2 hover:underline'
        >
          <BsX className='text-lg' />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
