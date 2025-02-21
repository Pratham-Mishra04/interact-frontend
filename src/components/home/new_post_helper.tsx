import React from 'react';
import { Info } from '@phosphor-icons/react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface Props {
  smallScreen?: boolean;
  iconClassName?: string;
}

const NewPostHelper = ({ smallScreen, iconClassName }: Props) => {
  return (
    <Popover>
      <PopoverTrigger>
        <Info className={cn('w-6 h-6', iconClassName)} />
      </PopoverTrigger>
      <PopoverContent className="w-[320px] max-h-[520px] overflow-y-auto thin_scrollbar shadow-lg dark:shadow-neutral-900">
        <div className={`space-y-4 ${smallScreen ? 'text-xs' : 'text-sm'}`}>
          <div className="text-center font-semibold">Tips to Make Your Content More Engaging</div>
          <ul className="list-disc flex flex-col gap-2 text-xs pl-4 mt-2">
            <li>Select text to reveal a popup with formatting options!</li>
            <li>
              Mention users, projects, openings, organizations, or events by typing <b>&quot;@&quot;</b> followed by a
              search term.
            </li>
            <li>
              To add a link, select your text and press <b>Ctrl + L</b>.
            </li>
            <li>
              Insert a divider by typing <b>&quot;---&quot;</b>.
            </li>
            <li>
              Create a list by typing <b>&quot;-&quot;</b> for a bullet list or <b>&quot;1.&quot;</b> for a numbered
              list.
            </li>
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NewPostHelper;
