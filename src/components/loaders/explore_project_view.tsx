import { X } from '@phosphor-icons/react';
import React from 'react';
interface Props {
  fadeIn?: boolean;
}

const ProjectViewLoader = ({ fadeIn }: Props) => {
  return (
    <div
      className={`w-screen h-screen dark:text-white font-primary fixed top-0 left-0 z-50 flex bg-backdrop backdrop-blur-2xl ${
        fadeIn ? 'animate-fade_third' : ''
      }`}
    >
      <div className="animate-pulse delay-0 w-16 h-screen flex flex-col items-center py-3 justify-between max-lg:fixed max-lg:top-0 max-lg:left-0">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-dark_primary_comp_hover cursor-pointer" />
      </div>

      <div className="w-[calc(100vw-128px)] max-lg:w-screen h-screen pt-3">
        <div className="w-full h-14 max-lg:pl-[68px] flex flex-col gap-1">
          <div className="animate-pulse delay-75 font-semibold bg-gray-200 dark:bg-dark_primary_comp_hover w-32 h-5 rounded-sm"></div>
          <div className="animate-pulse delay-100 text-xs bg-gray-200 dark:bg-dark_primary_comp_hover w-24 h-4 rounded-sm"></div>
        </div>
        <div className="w-full h-[calc(100vh-56px)] max-lg:overflow-y-auto flex max-lg:flex-col">
          <div className="animate-pulse delay-20 bg-gray-200 dark:bg-dark_primary_comp w-[calc(100vh-56px)] max-lg:w-full h-full max-lg:h-96 rounded-tl-md max-lg:rounded-none"></div>

          <div className="w-[calc(100vw-128px-(100vh-56px))] max-lg:w-full border-gray-400 border-t-[1px] border-r-[1px] dark:border-0 h-full max-lg:h-fit max-lg:min-h-[calc(100vh-65px-384px)] overflow-y-auto p-4 bg-white dark:bg-dark_primary_comp_hover flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="animate-pulse delay-300 w-64 h-10 bg-gray-200 dark:bg-dark_primary_comp_active rounded-md"></div>
            </div>
            <div className="animate-pulse delay-300 w-48 h-6 bg-gray-200 dark:bg-dark_primary_comp_active rounded-md"></div>

            <div className="animate-pulse delay-400 w-full flex flex-col gap-1">
              <div className="w-full h-4 bg-gray-200 dark:bg-dark_primary_comp_active rounded-sm"></div>
              <div className="w-full h-4 bg-gray-200 dark:bg-dark_primary_comp_active rounded-sm"></div>
              <div className="w-full h-4 bg-gray-200 dark:bg-dark_primary_comp_active rounded-sm"></div>
              <div className="w-full h-4 bg-gray-200 dark:bg-dark_primary_comp_active rounded-sm"></div>
            </div>
            <div className="animate-pulse delay-500 w-full flex flex-wrap items-center gap-2">
              <div className="w-16 h-6 bg-gray-200 dark:bg-dark_primary_comp_active rounded-sm"></div>
              <div className="w-16 h-6 bg-gray-200 dark:bg-dark_primary_comp_active rounded-sm"></div>
              <div className="w-16 h-6 bg-gray-200 dark:bg-dark_primary_comp_active rounded-sm"></div>
              <div className="w-16 h-6 bg-gray-200 dark:bg-dark_primary_comp_active rounded-sm"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectViewLoader;
