import React from 'react';

const ProjectLoader = () => {
  return (
    <div className="w-full flex flex-col gap-8">
      <div className="w-full h-96 max-md:h-40 rounded-lg bg-white dark:bg-dark_primary_comp_hover animate-pulse"></div>
      <div className="w-full flex flex-col gap-4">
        <div className="w-full flex items-center justify-between flex-wrap gap-4">
          <div className="w-1/2 max-md:w-full h-12 rounded-lg bg-white dark:bg-dark_primary_comp_hover animate-pulse"></div>
          <div className="w-fit flex-center gap-4">
            <div className="w-10 max-md:w-8 h-10 max-md:h-8 rounded-full bg-white dark:bg-dark_primary_comp_hover animate-pulse"></div>
            <div className="w-10 max-md:w-8 h-10 max-md:h-8 rounded-full bg-white dark:bg-dark_primary_comp_hover animate-pulse"></div>
            <div className="w-10 max-md:w-8 h-10 max-md:h-8 rounded-full bg-white dark:bg-dark_primary_comp_hover animate-pulse"></div>
          </div>
        </div>
        <div className="w-full h-8 rounded-lg bg-white dark:bg-dark_primary_comp_hover animate-pulse"></div>
        <div className="w-full h-24 rounded-lg bg-white dark:bg-dark_primary_comp_hover animate-pulse"></div>
        <div className="w-full h-16 rounded-lg bg-white dark:bg-dark_primary_comp_hover animate-pulse"></div>
        <div className="w-fit flex-center gap-4">
          <div className="w-10 max-md:w-8 h-10 max-md:h-8 rounded-full bg-white dark:bg-dark_primary_comp_hover animate-pulse"></div>
          <div className="w-10 max-md:w-8 h-10 max-md:h-8 rounded-full bg-white dark:bg-dark_primary_comp_hover animate-pulse"></div>
          <div className="w-10 max-md:w-8 h-10 max-md:h-8 rounded-full bg-white dark:bg-dark_primary_comp_hover animate-pulse"></div>
          <div className="w-10 max-md:w-8 h-10 max-md:h-8 rounded-full bg-white dark:bg-dark_primary_comp_hover animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default ProjectLoader;
