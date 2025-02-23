import React, { ReactNode } from 'react';

interface WrapperProps {
  children: ReactNode;
  index?: number;
  maxIndex?: number;
}

const PrimeWrapper: React.FC<WrapperProps> = ({ children, index = 0, maxIndex = 0 }) => {
  let includeBorder = true;
  if (index == 0 && index == maxIndex) includeBorder = false;
  return (
    <div
      className={`w-full bg-white dark:bg-dark_primary_comp rounded-lg ${
        index == 0 && includeBorder ? 'rounded-tl-none' : index == maxIndex && includeBorder && 'rounded-tr-none'
      } p-4 transition-ease-300`}
    >
      {children}
    </div>
  );
};

export default PrimeWrapper;
