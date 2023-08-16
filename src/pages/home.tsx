import Navbar from '@/components/common/navbar';
import Navigation from '@/components/common/navigation';
import NewPost from '@/sections/home_sections/new_post';
import Protect from '@/utils/protect';
import React from 'react';

const Feed = () => {
  return (
    <>
      <Navbar />
      <div className="w-full flex h-base">
        <Navigation index={1} />
        <div className="w-base h-screen overflow-auto flex flex-col gap-8 px-6 py-4">
          <NewPost />
        </div>
        <div className="w-navigation h-full pr-[120px] py-6 flex flex-col gap-2 border-l-2"></div>;
      </div>
    </>
  );
};

export default Protect(Feed);