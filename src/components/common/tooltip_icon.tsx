import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface Props {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
  excludeHoverEffect?: boolean;
  includeBorder?: boolean;
}

const TooltipIcon = ({ icon, label, onClick, className, excludeHoverEffect = false, includeBorder = false }: Props) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div
            onClick={onClick}
            className={cn(
              `w-full h-full rounded-full flex-center ${
                !excludeHoverEffect && 'p-2 hover:bg-primary_comp_hover dark:hover:bg-dark_primary_comp_hover'
              } ${includeBorder && 'border-[1px] border-primary_btn dark:border-dark_primary_btn'} transition-ease-300`,
              className
            )}
          >
            {icon}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TooltipIcon;
