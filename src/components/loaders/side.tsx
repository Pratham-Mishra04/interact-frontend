import { cn } from '@/lib/utils';
import { SidePrimeWrapper } from '@/wrappers/side';
import React from 'react';

const SideLoader = ({ boxes = 3, boxClassname }: { boxes?: number; boxClassname?: string }) => {
  return (
    <SidePrimeWrapper>
      <div className="w-full flex flex-col gap-4">
        <div className="w-3/5 h-8 rounded-lg bg-gray-200 dark:bg-dark_primary_comp_hover animate-pulse"></div>

        {Array.from({ length: boxes }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'w-full h-16 rounded-lg bg-gray-200 dark:bg-dark_primary_comp_hover animate-pulse',
              boxClassname
            )}
          ></div>
        ))}
      </div>
    </SidePrimeWrapper>
  );
};

export default SideLoader;
