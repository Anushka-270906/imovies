import React from 'react';
import { Film } from 'lucide-react';

const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <div className="relative flex items-center justify-center">
        <div className="w-14 h-14 rounded-full border-4 border-[#222F46] border-t-red-600 animate-spin" />
        <Film className="w-6 h-6 text-red-500 absolute" />
      </div>
      <p className="text-slate-400 text-sm font-medium animate-pulse">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
