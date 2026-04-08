import React from 'react';

const Header: React.FC = () => {
  return (
    <header className='bg-white border-b border-gray-200 sticky top-0'>
      <div className='p-1'>
        <div className='flex items-center justify-center'>
          <div className='flex  flex-col items-center space-x-3'>
            <span className='text-4xl'>⌨️</span>
            <div className='flex flex-col items-center'>
              <p className='text-sm text-gray-600'>
                Real-time Ml text prediction system
              </p>
              <p className='text-sm font-semibold text-gray-600'>
                Powered by N-gram
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
