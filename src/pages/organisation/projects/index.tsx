import Loader from '@/components/common/loader';
import ProjectCard from '@/components/organization/project_card';
import { EXPLORE_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import { Project } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import ProjectView from '@/sections/organization/projects/project_view';
import NewProject from '@/sections/organization/projects/new_project';
import { Info, Plus } from '@phosphor-icons/react';
import { userSelector } from '@/slices/userSlice';
import { useSelector } from 'react-redux';
import NoProjects from '@/components/fillers/your_projects';
import { navbarOpenSelector } from '@/slices/feedSlice';
import { SERVER_ERROR } from '@/config/errors';
import OrgSidebar from '@/components/common/org_sidebar';
import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import OrgMembersOnlyAndProtect from '@/utils/wrappers/org_members_only';
import { currentOrgSelector } from '@/slices/orgSlice';
import checkOrgAccess from '@/utils/funcs/check_org_access';
import { ORG_MANAGER } from '@/config/constants';
import WidthCheck from '@/utils/wrappers/widthCheck';
import AccessTree from '@/components/organization/access_tree';

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [clickedOnProject, setClickedOnProject] = useState(false);
  const [clickedProjectIndex, setClickedProjectIndex] = useState(-1);

  const [clickedOnInfo, setClickedOnInfo] = useState(false);
  const [clickedOnNewProject, setClickedOnNewProject] = useState(false);

  const [fadeIn, setFadeIn] = useState(true);

  const navbarOpen = useSelector(navbarOpenSelector);
  const user = useSelector(userSelector);

  const currentOrg = useSelector(currentOrgSelector);

  const getProjects = () => {
    setLoading(true);
    const URL = `${EXPLORE_URL}/users/projects/${currentOrg.userID}`;
    getHandler(URL)
      .then(res => {
        if (res.statusCode === 200) {
          let projectsData = res.data.projects || [];
          projectsData = projectsData.map((project: Project) => {
            return { ...project, user };
          });
          setProjects(projectsData);
          const projectSlug = new URLSearchParams(window.location.search).get('project');
          if (projectSlug && projectSlug != '') {
            projectsData.forEach((project: Project, index: number) => {
              if (project.slug == projectSlug) {
                setClickedOnProject(true);
                setClickedProjectIndex(index);
              }
            });
          }
          setLoading(false);
        } else {
          if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
          else {
            Toaster.error(SERVER_ERROR, 'error_toaster');
          }
        }
      })
      .catch(err => {
        Toaster.error(SERVER_ERROR, 'error_toaster');
      });
  };

  useEffect(() => {
    const action = new URLSearchParams(window.location.search).get('action');
    if (action && action == 'new_project') setClickedOnNewProject(true);
    getProjects();
  }, []);

  return (
    <BaseWrapper title={`Projects | ${currentOrg.title}`}>
      <OrgSidebar index={3} />
      <MainWrapper>
        <div className="w-full max-md:w-full mx-auto flex flex-col items-center relative gap-6 max-md:px-2 p-base_padding">
          <div className="w-full flex justify-between items-center">
            <div className="w-fit text-6xl font-semibold dark:text-white font-primary">Projects</div>

            <div className="flex items-center gap-2">
              {checkOrgAccess(ORG_MANAGER) && (
                <Plus
                  onClick={() => setClickedOnNewProject(true)}
                  size={42}
                  className="flex-center rounded-full hover:bg-white p-2 transition-ease-300 cursor-pointer"
                  weight="regular"
                />
              )}
              <Info
                onClick={() => setClickedOnInfo(true)}
                size={42}
                className="flex-center rounded-full hover:bg-white p-2 transition-ease-300 cursor-pointer"
                weight="regular"
              />
            </div>
          </div>
          {clickedOnNewProject && <NewProject setShow={setClickedOnNewProject} setProjects={setProjects} />}
          {clickedOnInfo && <AccessTree type="project" setShow={setClickedOnInfo} />}

          {loading ? (
            <Loader />
          ) : projects.length > 0 ? (
            <div
              className={`w-full grid ${
                navbarOpen ? 'grid-cols-3 gap-12' : 'grid-cols-4 gap-8'
              } max-lg:grid-cols-3 max-md:grid-cols-1 max-lg:gap-4 max-md:gap-6 max-md:px-4 max-md:justify-items-center pb-8 transition-ease-out-500`}
            >
              {clickedOnProject && (
                <ProjectView
                  projectSlugs={projects.map(project => project.slug)}
                  clickedProjectIndex={clickedProjectIndex}
                  setClickedProjectIndex={setClickedProjectIndex}
                  setClickedOnProject={setClickedOnProject}
                  fadeIn={fadeIn}
                  setFadeIn={setFadeIn}
                  setProjects={setProjects}
                />
              )}
              {projects.map((project, index) => {
                return (
                  <ProjectCard
                    key={project.id}
                    index={index}
                    size="[24vw]"
                    project={project}
                    setProjects={setProjects}
                    setClickedOnProject={setClickedOnProject}
                    setClickedProjectIndex={setClickedProjectIndex}
                  />
                );
              })}
            </div>
          ) : (
            <NoProjects setClickedOnNewProject={setClickedOnNewProject} />
          )}
        </div>
      </MainWrapper>
    </BaseWrapper>
  );
};

export default WidthCheck(OrgMembersOnlyAndProtect(Projects));
