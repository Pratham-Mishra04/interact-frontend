import React from 'react';

const ProfileCardLoader = () => {
  return (
    <div className="w-full h-fit pb-4 shadow-md gap-4 flex flex-col items-center bg-[#ffffff2d] backdrop-blur-md border-[1px] border-gray-300 max-lg:hidden rounded-lg">
      <div className="w-full relative">
        <div className="animate-pulse delay-0 w-full h-36 bg-white rounded-t-lg"></div>
        <div className="w-28 bg-white h-28 rounded-full absolute translate-x-1/2 -translate-y-1/2 right-1/2"></div>
      </div>

      <div className="w-full flex flex-col items-center gap-2 mt-14">
        <div className="animate-pulse delay-100 w-2/3 h-10 rounded-lg bg-white"></div>
        <div className="animate-pulse delay-100 w-1/3 h-5 rounded-lg bg-white"></div>
      </div>

      <div className="animate-pulse delay-150 w-full flex justify-center gap-6">
        <div className="w-1/3 h-4 bg-white rounded-md"></div>
        <div className="w-1/3 h-4 bg-white rounded-md"></div>
      </div>
    </div>
  );
};

export default ProfileCardLoader;
