import React from 'react';

const NoEvents = () => {
  return (
    <div className="w-full h-fit px-12 max-md:px-8 py-8 rounded-md dark:text-white font-primary border-gray-300 dark:border-dark_primary_btn border-[1px] bg-white dark:bg-dark_primary_comp hover:shadow-lg dark:hover:shadow-2xl flex-center flex-col gap-2 cursor-pointer transition-ease-500">
      <div className="text-xl max-md:text-lg font-medium text-center">
        <span className="text-2xl font-semibold max-md:block">Got an Event to Share?</span> Let the community know!
      </div>
      <div className="text-lg max-md:text-base text-center">
        Add your events and reach a wider audience. Share the details, get participants, and{' '}
        <span className="text-gradient font-bold text-xl max-md:text-lg">Make your event a success!</span>
        🎉
      </div>
    </div>
  );
};

export default NoEvents;
