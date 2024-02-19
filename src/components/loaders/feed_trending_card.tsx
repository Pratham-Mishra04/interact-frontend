import React from 'react';
import UserCardLoader from './user_card';

const TrendingCardLoader = () => {
  return (
    <>
      <div className="w-full h-fit flex flex-col gap-6">
        <div className="w-full bg-[#ffffff2d] flex flex-col gap-4 p-4 shadow-md backdrop-blur-md border-[1px] border-gray-300 rounded-lg">
          <div className="animate-pulse delay-75 w-3/4 text-3xl h-10 rounded-lg bg-white dark:bg-dark_primary_comp_hover text-center font-bold"></div>
          <div className="animate-pulse delay-150 w-full flex flex-wrap gap-2">
            <div className="w-20 h-5 bg-white dark:bg-dark_primary_comp_hover rounded-md"></div>
            <div className="w-20 h-5 bg-white dark:bg-dark_primary_comp_hover rounded-md"></div>
            <div className="w-20 h-5 bg-white dark:bg-dark_primary_comp_hover rounded-md"></div>
            <div className="w-20 h-5 bg-white dark:bg-dark_primary_comp_hover rounded-md"></div>
            <div className="w-20 h-5 bg-white dark:bg-dark_primary_comp_hover rounded-md"></div>
          </div>
        </div>

        <div className="w-full bg-[#ffffff2d] flex flex-col gap-4 p-4 shadow-md backdrop-blur-md border-[1px] border-gray-300 rounded-lg">
          <div className="animate-pulse delay-75 w-3/4 text-3xl h-10 rounded-lg bg-white dark:bg-dark_primary_comp_hover text-center font-bold"></div>
          <div className="w-full flex flex-col gap-2">
            {Array(3)
              .fill(1)
              .map((_, i) => (
                <UserCardLoader key={i} />
              ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default TrendingCardLoader;
