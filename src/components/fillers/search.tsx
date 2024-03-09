import React from 'react';

interface Props {
  title?: string;
}

const NoSearch = ({ title }: Props) => {
  const search = new URLSearchParams(window.location.search).get('search') || '';
  return (
    <div className="w-3/5 max-md:w-[95%] h-fit mx-auto my-2 max-md:my-0 px-12 max-md:px-8 py-8 max-md:py-4 rounded-md font-primary text-xl dark:text-white border-gray-300 border-[1px] dark:border-dark_primary_btn bg-white dark:bg-dark_primary_comp hover:shadow-lg dark:hover:shadow-2xl flex-center max-md:flex-col gap-2 cursor-default transition-ease-500">
      {title ? (
        <span className="font-bold text-xl text-gradient">{title}</span>
      ) : (
        <>
          No Results found for <span className="font-bold text-2xl text-gradient mb-1">&quot;{search}&quot;</span>
        </>
      )}
    </div>
  );
};

export default NoSearch;
