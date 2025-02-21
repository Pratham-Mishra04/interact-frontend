import { Backspace, SortAscending } from '@phosphor-icons/react';
import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { DropdownOption, FilterButton } from './common';

interface Props {
  fieldName: string;
  options: string[];
  icon: ReactElement;
  selectedOption: string;
  setSelectedOption: React.Dispatch<React.SetStateAction<string>>;
}

const Order = ({ fieldName, options, icon, selectedOption, setSelectedOption }: Props) => {
  const [show, setShow] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setShow(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={menuRef} className="relative z-10">
      <FilterButton fieldName={fieldName} filledText={selectedOption} icon={icon} setShow={setShow} />
      {show && (
        <div className="w-48 h-fit p-3 bg-white dark:bg-dark_primary_comp dark:border-dark_primary_btn flex flex-col gap-2 absolute -bottom-2 left-0 translate-y-full rounded-md border-[1px] border-gray-200 shadow-md animate-fade_third">
          <div className="text-xl font-medium">{fieldName}</div>
          <div className="w-full flex flex-col gap-1">
            {options.map((option, index) => (
              <DropdownOption
                key={index}
                option={option}
                isOptionSelected={selectedOption == options[index]}
                onClick={() => {
                  setSelectedOption(option);
                  setShow(false);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Order;
