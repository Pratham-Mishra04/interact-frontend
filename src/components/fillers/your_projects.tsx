import React from 'react';

interface Props {
  setClickedOnNewProject: React.Dispatch<React.SetStateAction<boolean>>;
}

const NoProjects = ({ setClickedOnNewProject }: Props) => {
  return (
    <div
      onClick={() => setClickedOnNewProject(true)}
      className="w-2/3 max-md:w-[90%] h-fit mx-auto my-5 px-12 max-md:px-8 py-8 rounded-md font-primary dark:text-white border-gray-300 border-[1px] bg-white dark:bg-dark_primary_comp hover:shadow-lg dark:hover:shadow-2xl flex-center flex-col gap-2 cursor-pointer transition-ease-500"
    >
      <div className="text-xl max-md:text-lg font-medium text-center">
        <span className="text-2xl font-semibold">Uh</span> Looks like you&apos;re all caught up on your projects :(
      </div>
      <div className="flex flex-col gap-1 max-md:text-sm text-center">
        <div> Time to get cracking on a new one! Who knows, it could be the next big thing.😉</div>
        <div>
          Go ahead and{' '}
          <span className="w-fit mx-auto font-bold text-xl max-md:text-lg text-gradient">Create A New Project!</span> 🚀
        </div>
      </div>
    </div>
  );
};

export default NoProjects;
