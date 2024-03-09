import React from 'react';

const NoPersonalChats = () => {
  //TODO onClick add new personal chat
  return (
    <div className="w-full h-fit mx-auto my-2 px-12 max-md:px-8 py-8 rounded-md font-primary dark:text-white border-gray-300 border-[1px] bg-white dark:bg-dark_primary_comp hover:shadow-lg dark:hover:shadow-2xl flex-center flex-col gap-2 cursor-default transition-ease-500">
      <div className="text-xl max-md:text-lg font-medium text-center">Your messaging inbox seems a bit empty :(</div>
      <div className="flex flex-col gap-1 max-md:text-sm text-center">
        <div> Why not reach out and say hi? You might just spark some amazing connections! 🗨️</div>
        <div>
          <span className="w-fit mx-auto font-bold text-xl max-md:text-lg text-gradient">
            Start a conversation today!
          </span>{' '}
          🌟
        </div>
      </div>
    </div>
  );
};

export default NoPersonalChats;
