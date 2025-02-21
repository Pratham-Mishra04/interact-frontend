import MenuBar from '@/components/common/menu_bar';
import Sidebar from '@/components/common/sidebar';
import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import PrimeWrapper from '@/wrappers/prime';
import SideBarWrapper, { SidePrimeWrapper } from '@/wrappers/side';
import React, { useState } from 'react';
import ExploreProjects from '@/screens/projects/explore';
import BookmarkProjects from '@/screens/projects/bookmarks';
import CombinedProjects from '@/screens/projects/workspace';
import NewProject from '@/sections/workspace/new_project';
import { useSelector } from 'react-redux';
import { userIDSelector } from '@/slices/userSlice';
import { Project } from '@/types';
import ProjectView from '@/sides/project/project_view';

const Projects = () => {
  const [active, setActive] = useState(0);
  const userID = useSelector(userIDSelector);

  const [triggerWorkspaceReload, setTriggerWorkspaceReload] = useState(false);
  const [clickedProject, setClickedProject] = useState<Project | null>(null);

  return (
    <BaseWrapper title="Projects">
      <Sidebar index={2} />
      <MainWrapper sidebarLayout>
        <div className="w-2/3 max-md:w-full">
          {userID ? (
            <>
              <MenuBar items={['Explore', 'Workspace', 'Saved']} active={active} setState={setActive} />
              {active == 0 ? (
                <PrimeWrapper index={0} maxIndex={2}>
                  <ExploreProjects setClickedProject={setClickedProject} />
                </PrimeWrapper>
              ) : active == 1 ? (
                <PrimeWrapper index={1} maxIndex={2}>
                  <CombinedProjects setClickedProject={setClickedProject} triggerReload={triggerWorkspaceReload} />
                </PrimeWrapper>
              ) : (
                active == 2 && (
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
        <SideBarWrapper hideMD>
          {userID && (
            <SidePrimeWrapper>
              <NewProject setTriggerReload={setTriggerWorkspaceReload} setActiveTab={setActive} />
            </SidePrimeWrapper>
          )}
          {clickedProject && (
            <ProjectView
              project={clickedProject}
              setProject={setClickedProject as React.Dispatch<React.SetStateAction<Project>>}
              openInNewTab={active == 1}
            />
          )}
        </SideBarWrapper>
      </MainWrapper>
    </BaseWrapper>
  );
};

export default Projects;
