import React from 'react';

const Header: React.FC = () => {
  return (
    <header className='bg-white shadow-md'>
      <div className='container mx-auto px-4 py-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <span className='text-4xl'>⌨️</span>
            <div>
              <h1 className='text-2xl font-bold text-gray-800'>
                Text Predictor
              </h1>
              <p className='text-sm text-gray-600'>
                AI-powered next-word prediction
              </p>
            </div>
          </div>

          <div className='hidden md:flex items-center space-x-4'>
            <div className='text-right'>
              <p className='text-xs text-gray-500'>Powered by</p>
              <p className='text-sm font-semibold text-purple-600'>
                N-gram Models
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
