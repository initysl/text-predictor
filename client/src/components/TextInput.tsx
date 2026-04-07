import React from 'react';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  disabled?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({
  value,
  onChange,
  onClear,
  disabled = false,
}) => {
  return (
    <div className='bg-white rounded-lg shadow-lg p-6'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-xl font-semibold text-gray-800'>Your Text</h2>
        <button
          onClick={onClear}
          disabled={disabled || !value}
          className='px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          🗑️ Clear
        </button>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder='Start typing here...'
        className='w-full h-40 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none resize-none text-lg disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors'
      />

      <div className='mt-4 flex items-center justify-between text-sm text-gray-600'>
        <span>{value.split(/\s+/).filter(Boolean).length} words</span>
        <span>{value.length} characters</span>
      </div>
    </div>
  );
};

export default TextInput;
