import Sidebar from '@/components/common/sidebar';
import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import PrimeWrapper from '@/wrappers/prime';
import React, { useState } from 'react';
import SideBarWrapper, { SidePrimeWrapper } from '@/wrappers/side';
import ExploreProjects from '@/screens/projects/explore';
import BookmarkProjects from '@/screens/projects/bookmarks';
import CombinedProjects from '@/screens/projects/workspace';
import { useSelector } from 'react-redux';
import { userIDSelector } from '@/slices/userSlice';

const MenuBar = ({
  items,
  active,
  setState,
}: {
  items: string[];
  active: number;
  setState: (index: number) => void;
}) => {
  return (
    <div className="flex py-2 rounded-lg mb-2 space-x-2">
      {items.map((item, index) => (
        <button
          key={item}
          onClick={() => setState(index)}
          className={`px-4 py-2 rounded-md text-white transition ${
            active === index ? 'bg-[#2FB0F6]' : 'border border-[#525252]'
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
};

const Projects = () => {
  const [active, setActive] = useState<number>(0);
  const userID = useSelector(userIDSelector);

  return (
    <BaseWrapper title="Projects">
      <Sidebar index={2} />
      <MainWrapper sidebarLayout restrictWidth>
        <div className="w-full">
          {userID ? (
            <>
              <MenuBar items={['Explore', 'Workspace', 'Saved']} active={active} setState={setActive} />
              {active === 0 ? (
                <ExploreProjects />
              ) : active === 1 ? (
                <PrimeWrapper index={1} maxIndex={2}>
                  <CombinedProjects />
                </PrimeWrapper>
              ) : (
                active === 2 && (
                  <PrimeWrapper index={2} maxIndex={2}>
                    <BookmarkProjects />
                  </PrimeWrapper>
                )
              )}
            </>
          ) : (
            <PrimeWrapper>
              <ExploreProjects />
            </PrimeWrapper>
          )}
        </div>
      </MainWrapper>
    </BaseWrapper>
  );
};

export default Projects;
