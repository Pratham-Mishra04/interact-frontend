import Sidebar from '@/components/common/sidebar';
import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import PrimeWrapper from '@/wrappers/prime';
import React, { ReactNode, useState } from 'react';
import SideBarWrapper, { SidePrimeWrapper } from '@/wrappers/side';
import ExploreProjects from '@/screens/projects/explore';
import BookmarkProjects from '@/screens/projects/bookmarks';
import CombinedProjects from '@/screens/projects/workspace';
import NewProject from '@/sections/workspace/new_project';
import { useSelector } from 'react-redux';
import { userIDSelector } from '@/slices/userSlice';
import { Project } from '@/types';
import ProjectView from '@/sides/project/project_view';
import CreateNewProject from '@/screens/projects/createNewProject';
interface WrapperProps {
  children: ReactNode;
  index?: number;
  maxIndex?: number;
}

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
    <div className="flex py-2 rounded-lg">
      {items.map((item, index) => (
        <button
          key={item}
          onClick={() => setState(index)}
          className={`px-4 py-2 m-2 rounded-md text-white transition ${
            active === index ? 'bg-[#2FB0F6]' : 'border border-[#525252]'
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
};
// const PrimeWrapper: React.FC<WrapperProps> = ({ children, index = 0, maxIndex = 0 }) => {
//   let includeBorder = true;
//   if (index == 0 && index == maxIndex) includeBorder = false;
//   return (
//     <div
//       className={`w-full bg-white dark:bg-dark_primary_comp rounded-lg ${
//         index == 0 && includeBorder ? 'rounded-lg' : index == maxIndex && includeBorder && ''
//       } px-6 p-3 transition-ease-300`}
//     >
//       {children}
//     </div>
//   );
// };

const Projects = () => {
  const [active, setActive] = useState<number>(0);
  const userID = useSelector(userIDSelector);

  const [triggerWorkspaceReload, setTriggerWorkspaceReload] = useState<boolean>(false);
  const [clickedProject, setClickedProject] = useState<Project | null>(null);

  return (
    <BaseWrapper title="Projects">
      <Sidebar index={2} />
      <MainWrapper sidebarLayout>
        <div className="w-3/4 max-md:w-full">
          {userID ? (
            <>
              <MenuBar items={['Explore', 'Workspace', 'Saved']} active={active} setState={setActive} />
              {active === 0 ? (
                <PrimeWrapper index={-1} maxIndex={0}>
                  <ExploreProjects setClickedProject={setClickedProject} />
                </PrimeWrapper>
              ) : active === 1 ? (
                <PrimeWrapper index={1} maxIndex={2}>
                  <CombinedProjects setClickedProject={setClickedProject} triggerReload={triggerWorkspaceReload} />
                </PrimeWrapper>
              ) : (
                active === 2 && (
                  <PrimeWrapper index={2} maxIndex={2}>
                    <BookmarkProjects setClickedProject={setClickedProject} />
                  </PrimeWrapper>
                )
              )}
            </>
          ) : (
            <PrimeWrapper>
              <ExploreProjects setClickedProject={setClickedProject} />
            </PrimeWrapper>
          )}
        </div>
        {/* Sidebar with New Project & Project View */}
        <SideBarWrapper hideMD>
          {/* {userID && (
            <SidePrimeWrapper>
              <NewProject setTriggerReload={setTriggerWorkspaceReload} setActiveTab={setActive} />
            </SidePrimeWrapper>
          )} */}
          {clickedProject && <CreateNewProject />}
        </SideBarWrapper>
      </MainWrapper>
    </BaseWrapper>
  );
};

export default Projects;
