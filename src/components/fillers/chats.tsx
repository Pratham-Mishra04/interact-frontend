import React from 'react';

const NoChats = () => {
  return (
    <div className="w-full h-fit mx-auto my-2 px-12 max-md:px-8 py-8 rounded-md font-primary dark:text-white border-gray-300 dark:border-dark_primary_btn border-[1px] bg-white dark:bg-dark_primary_comp hover:shadow-lg dark:hover:shadow-2xl flex-center cursor-default transition-ease-500">
      <span className="font-bold text-xl text-gradient">No Chats Here :(</span>
    </div>
  );
};

export default NoChats;
