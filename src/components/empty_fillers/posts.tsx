import React from 'react';

const NoPosts = () => {
  return (
    <div className="w-full h-fit px-12 max-md:px-8 py-8 rounded-md dark:text-white font-primary border-gray-300 dark:border-dark_primary_btn border-[1px] bg-white dark:bg-dark_primary_comp hover:shadow-lg dark:hover:shadow-2xl flex-center flex-col gap-2 cursor-pointer transition-ease-500">
      <div className="text-xl max-md:text-lg font-medium text-center">
        <span className="text-2xl font-semibold max-md:block">Got Something to Share?</span> Your feed&apos;s a little
        lonely
      </div>
      <div className="text-lg max-md:text-base text-center">
        Create a post and share your thoughts, or updates and{' '}
        <span className="text-gradient font-bold text-xl max-md:text-lg"> Build Your Community!</span>
      </div>
    </div>
  );
};

export default NoPosts;
