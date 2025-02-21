import { CaretDown } from '@phosphor-icons/react';
import React, { ReactElement } from 'react';

interface FilterButtonProps {
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  fieldName: string;
  filledText: string;
  icon: ReactElement;
}

export const FilterButton = ({ setShow, fieldName, filledText, icon }: FilterButtonProps) => {
  return (
    <div
      onClick={() => setShow(prev => !prev)}
      className="w-fit bg-primary_black capitalize flex-center gap-1 font-medium text-white py-1 px-3 rounded-md cursor-pointer"
    >
      {icon}
      {filledText != '' ? (
        filledText.replaceAll('_', ' ')
      ) : (
        <div className="flex-center gap-1">
          {fieldName}
          <CaretDown size={12} />
        </div>
      )}
    </div>
  );
};

interface DropdownOptionProps {
  option: string;
  isOptionSelected: boolean;
  onClick?: () => void;
}

export const DropdownOption = ({ option, isOptionSelected, onClick }: DropdownOptionProps) => {
  return (
    <div
      onClick={onClick}
      className={`w-full ${
        isOptionSelected
          ? 'bg-primary_comp_hover dark:bg-dark_primary_comp_active text-primary_text font-medium'
          : 'hover:bg-primary_comp hover:bg-dark_primary_comp_hover text-primary_black dark:text-white'
      } text-sm rounded-md p-2 flex items-center capitalize transition-ease-300 cursor-pointer`}
    >
      {option.replaceAll('_', ' ')}
    </div>
  );
};
