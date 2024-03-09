import React from 'react';

interface Props {
  title?: string;
}

const NoUserItems = ({ title = 'No Items Here :(' }: Props) => {
  return (
    <div className="w-full h-fit mx-auto my-2 px-12 max-md:px-8 py-8 rounded-md font-primary dark:text-white border-gray-300 border-[1px] dark:border-dark_primary_btn bg-white dark:bg-dark_primary_comp hover:shadow-lg dark:hover:shadow-2xl flex-center cursor-default transition-ease-500">
      <span className="font-bold text-xl text-gradient">{title}</span>
    </div>
  );
};

export default NoUserItems;
