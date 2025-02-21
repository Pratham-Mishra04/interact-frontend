import React from 'react';

const NoCommunityFeed = () => {
  return (
    <div className="w-full h-fit px-12 max-md:px-8 py-6 rounded-md dark:text-white font-primary border-gray-300 dark:border-dark_primary_btn border-[1px] bg-white dark:bg-dark_primary_comp flex-center flex-col gap-2">
      <div className="text-xl max-md:text-lg font-medium text-center">
        <span className="text-2xl font-semibold max-md:block">Empty Here?</span> Looks like this community is just
        getting started.
      </div>
      <div className="text-lg max-md:text-base text-center">
        Join the conversation and post something or explore other trending communities on the{' '}
        <span className="font-bold text-xl max-md:text-lg text-gradient">Communities</span> tab! 🚀
      </div>
    </div>
  );
};

export default NoCommunityFeed;
