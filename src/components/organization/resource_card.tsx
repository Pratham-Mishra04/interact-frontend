import { ResourceBucket } from '@/types';
import { Lock } from '@phosphor-icons/react';
import React from 'react';

interface Props {
  resource: ResourceBucket;
  setClickedOnResource?: React.Dispatch<React.SetStateAction<boolean>>;
  setClickedResource?: React.Dispatch<React.SetStateAction<ResourceBucket>>;
  checkerFunc: (a: string) => boolean;
  smaller?: boolean;
}

const ResourceCard = ({ resource, setClickedOnResource, setClickedResource, checkerFunc, smaller }: Props) => {
  return (
    <div
      onClick={() => {
        if (setClickedOnResource) setClickedOnResource(true);
        if (setClickedResource) setClickedResource(resource);
      }}
      className={`${
        smaller ? 'w-full p-2' : 'w-72 flex-col px-6 py-8'
      } bg-white dark:bg-dark_primary_comp dark:hover:bg-dark_primary_comp_hover relative flex items-center gap-2 rounded-lg border-gray-400 dark:border-dark_primary_btn border-[1px] ${
        checkerFunc(resource.viewAccess) ? 'cursor-pointer hover:shadow-xl' : 'cursor-default'
      } transition-ease-300`}
    >
      {!checkerFunc(resource.viewAccess) && <Lock className="absolute top-4 right-4" size={24} />}

      <div
        className={`${
          smaller ? 'w-14 h-14' : 'w-24 h-24'
        } flex-center flex-col items-center border-dark_primary_btn border-[5px] rounded-full`}
      >
        <div className={`${smaller ? 'text-xl' : 'text-5xl max-md:text-2xl'} font-bold text-gradient`}>
          {resource.noFiles}
        </div>
        <div className={`w-40 ${smaller ? 'text-xxs' : ''} text-center`}>File{resource.noFiles != 1 ? 's' : ''}</div>
      </div>
      <div className={`${smaller ? '' : 'items-center text-center gap-1'} w-full flex flex-col`}>
        <div className={`${smaller ? 'font-medium text-xl' : 'font-semibold text-3xl'} line-clamp-1`}>
          {resource.title}
        </div>
        <div
          className={`${
            smaller ? 'text-xs' : 'text-sm'
          } text-gray-600 dark:text-gray-300 line-clamp-2 whitespace-pre-line`}
        >
          {resource.description}
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
