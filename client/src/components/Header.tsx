import React from 'react';

const Header: React.FC = () => {
  return (
    <header className='bg-white shadow-md'>
      <div className='px-4 py-6'>
        <div className='flex items-center justify-center'>
          <div className='flex  flex-col items-center space-x-3'>
            <span className='text-4xl'>⌨️</span>
            <div className='flex flex-col items-center'>
              <p className='text-sm text-gray-600'>
                Real-time Ml text prediction system
              </p>
              <p className='text-sm font-semibold text-purple-600'>
                Powered by N-gram Models
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
