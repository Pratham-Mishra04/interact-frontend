import React from 'react';

const UserCardLoader = () => {
  return (
    <div
      className={`w-full font-primary bg-gray-100 dark:bg-dark_primary_comp animate-pulse border-[1px] rounded-lg flex flex-col
px-2 py-3 gap-2
transition-ease-300`}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2 w-fit">
          <div className={`rounded-full w-10 h-10 bg-white dark:bg-dark_primary_comp_hover`}></div>
          <div className="flex flex-col gap-2 font-light">
            <div className={`w-24 h-4 rounded-lg bg-white dark:bg-dark_primary_comp_hover`}></div>
            <div className="w-12 h-2 rounded-lg bg-white dark:bg-dark_primary_comp_hover"></div>
          </div>
        </div>
        <div className="w-12 h-4 rounded-xl bg-white dark:bg-dark_primary_comp_hover"></div>
      </div>

      <div className={`w-full pl-12 flex flex-col gap-1`}>
        <div className="w-full h-4 rounded-md bg-white dark:bg-dark_primary_comp_hover"></div>
        <div className="w-full h-4 rounded-md bg-white dark:bg-dark_primary_comp_hover"></div>
      </div>
    </div>
  );
};

export default UserCardLoader;
