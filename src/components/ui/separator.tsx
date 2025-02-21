import { cn } from '@/lib/utils';
import React from 'react';

const Separator = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn('w-full h-[1px] border-t-[1px] border-primary_btn dark:border-dark_primary_btn', className)}
    ></div>
  );
};

export default Separator;
