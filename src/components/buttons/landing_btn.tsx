import { cn } from '@/lib/utils';
import React from 'react';

const LandingButton = ({ label, link, className }: { label: string; link?: string; className?: string }) => {
  return (
    <button
      className={cn(
        'w-fit bg-sky-400 hover:bg-sky-600 text-white px-5 max-md:px-3 py-1 rounded-xl max-md:rounded-lg max-md:text-xs transition-ease-300',
        className
      )}
    >
      {label}
    </button>
  );
};

export default LandingButton;
