import getDomainName from '@/utils/funcs/get_domain_name';
import Link from 'next/link';
import React from 'react';
import getIcon from '@/utils/funcs/get_icon';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Props {
  links: string[];
  title?: string;
  excludeTitle?: boolean;
}

const Links = ({ links, title = 'Links', excludeTitle = false }: Props) => {
  return (
    <TooltipProvider>
      {links && links.length > 0 && (
        <div className="w-full flex flex-col gap-2 relative">
          {!excludeTitle && <div className="text-lg font-semibold">{title}</div>}
          <div className="w-full flex gap-4 justify-start flex-wrap">
            {links.map(link => {
              return (
                <Link key={link} href={link} target="_blank" className="relative group">
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="hover:scale-110 transition-ease-300"> {getIcon(getDomainName(link), 40)}</div>
                    </TooltipTrigger>
                    <TooltipContent className='className="w-fit px-4 py-2 rounded-lg bg-white dark:bg-dark_primary_comp_hover border-2 border-gray-200 dark:border-dark_primary_btn text-primary_black dark:text-white capitalize text-xs text-center font-semibold shadow-xl"'>
                      {getDomainName(link)}
                    </TooltipContent>
                  </Tooltip>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </TooltipProvider>
  );
};

export default Links;
