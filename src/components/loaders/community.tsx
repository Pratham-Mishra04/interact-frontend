import PrimeWrapper from '@/wrappers/prime';
import React from 'react';
import PostsLoader from './posts';

const CommunityLoader = () => {
  return (
    <div className="w-full flex flex-col gap-2">
      <div className="w-full relative">
        <div className="w-full h-48 max-md:h-24 rounded-lg bg-white dark:bg-dark_primary_comp_hover animate-pulse"></div>
        <div className="w-full flex items-end gap-2 absolute -translate-y-1/2 pl-12 max-md:pl-4">
          <div className="w-24 max-md:w-16 h-24 max-md:h-16 rounded-full bg-white dark:bg-dark_primary_comp_hover animate-pulse border-gray-200 dark:border-dark_primary_btn border-4"></div>
          <div className="w-[calc(100%-96px)] flex justify-between items-center pb-1 flex-wrap">
            <div className="w-1/3 max-md:w-full h-8 max-md:h-6 rounded-lg bg-white dark:bg-dark_primary_comp_hover animate-pulse"></div>
            <div className="w-fit flex-center gap-2 flex-wrap max-md:hidden">
              <div className="w-16 h-8 rounded-lg bg-white dark:bg-dark_primary_comp_hover animate-pulse"></div>
              <div className="w-16 h-8 rounded-lg bg-white dark:bg-dark_primary_comp_hover animate-pulse"></div>
              <div className="w-16 h-8 rounded-lg bg-white dark:bg-dark_primary_comp_hover animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full flex-center gap-2 flex-wrap md:hidden mt-8">
        <div className="w-12 h-6 rounded-full bg-white dark:bg-dark_primary_comp_hover animate-pulse"></div>
        <div className="w-12 h-6 rounded-full bg-white dark:bg-dark_primary_comp_hover animate-pulse"></div>
        <div className="w-12 h-6 rounded-full bg-white dark:bg-dark_primary_comp_hover animate-pulse"></div>
      </div>
      <div className="w-full flex max-md:flex-col-reverse gap-4 mt-14 max-md:mt-2">
        <div className="w-2/3 max-md:w-full">
          <PrimeWrapper index={0} maxIndex={0}>
            <div className="w-full">
              <PostsLoader />
            </div>
          </PrimeWrapper>
        </div>
        <div className="w-1/3 max-md:w-full h-fit max-h-[calc(100vh-80px)] max-md:static overflow-y-auto sticky top-[80px] bg-white dark:bg-dark_primary_comp flex flex-col gap-2 p-4 rounded-lg">
          <div className="w-full h-16 rounded-lg bg-white dark:bg-dark_primary_comp_hover animate-pulse"></div>
          <div className="w-full h-8 rounded-lg bg-white dark:bg-dark_primary_comp_hover animate-pulse"></div>
          <div className="w-full flex items-center justify-center gap-8 my-2">
            <div className="flex-center flex-col gap-2 cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-white dark:bg-dark_primary_comp_hover animate-pulse"></div>
              <div className="w-16 h-6 rounded-lg bg-white dark:bg-dark_primary_comp_hover animate-pulse"></div>
            </div>
            <div className="flex-center flex-col gap-2 cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-white dark:bg-dark_primary_comp_hover animate-pulse"></div>
              <div className="w-16 h-6 rounded-lg bg-white dark:bg-dark_primary_comp_hover animate-pulse"></div>
            </div>
            <div className="flex-center flex-col gap-2 cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-white dark:bg-dark_primary_comp_hover animate-pulse"></div>
              <div className="w-16 h-6 rounded-lg bg-white dark:bg-dark_primary_comp_hover animate-pulse"></div>
            </div>
          </div>
          <div className="w-full h-[1px] bg-gray-300 dark:bg-dark_primary_btn my-2"></div>
          <div className="w-2/5 h-8 rounded-lg bg-white dark:bg-dark_primary_comp_hover animate-pulse"></div>
          <div className="w-full h-16 rounded-lg bg-white dark:bg-dark_primary_comp_hover animate-pulse"></div>
          <div className="w-full h-16 rounded-lg bg-white dark:bg-dark_primary_comp_hover animate-pulse"></div>
          <div className="w-full h-16 rounded-lg bg-white dark:bg-dark_primary_comp_hover animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default CommunityLoader;
