import { setExploreTab } from '@/slices/feedSlice';
import Link from 'next/link';
import React from 'react';
import { useDispatch } from 'react-redux';

const NoProjectBookmarks = () => {
  const dispatch = useDispatch();
  return (
    <Link
      href={'/explore'}
      onClick={() => dispatch(setExploreTab(0))}
      className="w-2/3 max-md:w-[90%] h-fit mx-auto my-5 px-12 max-md:px-8 py-8 rounded-md font-primary dark:text-white border-gray-300 border-[1px] bg-white dark:bg-dark_primary_comp hover:shadow-lg dark:hover:shadow-2xl flex-center flex-col gap-2 transition-ease-500"
    >
      <div className="text-xl max-md:text-lg font-medium text-center">
        <span className="text-2xl font-semibold">Whoops! </span> aren&apos;t you saving your favorite projects?
      </div>
      <div className="flex flex-col gap-1 max-md:text-sm text-center">
        <div> Explore great projects and click that Bookmark button to keep them handy! ✨</div>
        <div>
          Begin curating your
          <span className="w-fit mx-auto font-bold text-xl max-md:text-lg text-gradient">
            {' '}
            Handpicked Watchlist!
          </span>{' '}
          📚
        </div>
      </div>
    </Link>
  );
};

export default NoProjectBookmarks;
