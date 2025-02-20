import React, { useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useIsMobile } from '@/hooks/use-mobile';
import { Funnel } from '@phosphor-icons/react';

interface Props {
  orders: string[];
  current: string;
  setState: React.Dispatch<React.SetStateAction<string>>;
}

const OrderMenu = ({ orders, current, setState }: Props) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const isMobile = useIsMobile();
  return isMobile ? (
    <div className="w-full flex justify-end">
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger>
          <Funnel size={20} />
        </PopoverTrigger>
        <PopoverContent className="w-40 p-1 text-xs" align="end">
          <div className="w-full space-y-2">
            {orders.map((order, index) => (
              <div
                onClick={() => {
                  setIsPopoverOpen(false);
                  setState(order);
                }}
                className="w-full capitalize py-2 max-md:text-center hover:bg-primary_comp dark:hover:bg-dark_primary_comp_hover rounded-md cursor-pointer transition-ease-300"
                key={index}
              >
                {order.replaceAll('_', ' ')}
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  ) : (
    <ToggleGroup
      className="w-full flex-center gap-4 max-md:flex-wrap"
      value={current}
      onValueChange={value => setState(value)}
      type="single"
    >
      {orders.map((order, index) => (
        <ToggleGroupItem className="capitalize max-md" key={index} value={order} size="lg">
          {order.replaceAll('_', ' ')}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
};

export default OrderMenu;
