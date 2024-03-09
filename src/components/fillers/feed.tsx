import { setHomeTab } from '@/slices/feedSlice';
import React from 'react';
import { useDispatch } from 'react-redux';

const NoFeed = () => {
  const dispatch = useDispatch();
  return (
    <div
      onClick={() => dispatch(setHomeTab(1))}
      className="w-full h-fit px-12 max-md:px-8 py-8 rounded-md dark:text-white font-primary border-gray-300 dark:border-dark_primary_btn border-[1px] bg-white dark:bg-dark_primary_comp hover:shadow-lg dark:hover:shadow-2xl flex-center flex-col gap-2 cursor-pointer transition-ease-500"
    >
      <div className="text-xl max-md:text-lg font-medium text-center">
        <span className="text-2xl font-semibold max-md:block">Fresh to the scene?</span> Your feed&apos;s a little
        lonely
      </div>
      <div className="text-lg max-md:text-base text-center">
        Follow users to see their posts, and explore trending posts on the{' '}
        <span className="font-bold text-xl max-md:text-lg text-gradient">Discover</span> page! 🚀
      </div>
    </div>
  );
};

export default NoFeed;
