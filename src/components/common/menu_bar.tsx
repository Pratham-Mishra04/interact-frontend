import { ActionCreatorWithPayload } from '@reduxjs/toolkit/dist/createAction';
import React from 'react';
import { useDispatch } from 'react-redux';

interface Props {
  items: string[];
  active: number;
  setReduxState?: ActionCreatorWithPayload<number>;
  setState?: React.Dispatch<React.SetStateAction<number>>;
}

const MenuBar = ({ items, active, setReduxState, setState }: Props) => {
  const dispatch = useDispatch();
  return (
    <div className="w-full rounded-lg z-10">
      <div className="w-full flex">
        {items.map((item, index) => (
          <div
            key={index}
            onClick={() => {
              if (setReduxState) dispatch(setReduxState(index));
              else if (setState) setState(index);
            }}
            className={`relative ${
              active === index
                ? 'bg-white dark:bg-dark_primary_comp text-primary_text'
                : 'hover:bg-gray-100 dark:hover:bg-dark_primary_comp_hover text-gray-500'
            } w-1/2 max-md:px-4 h-full font-primary font-medium flex-center text-lg max-md:text-sm rounded-t-full pt-2 pb-1 transition-ease-300 cursor-pointer`}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuBar;
