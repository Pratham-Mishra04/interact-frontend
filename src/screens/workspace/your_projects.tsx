import Loader from '@/components/common/loader';
import ProjectCard from '@/components/workspace/project_card';
import { WORKSPACE_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import { Project } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import ProjectView from '@/sections/workspace/project_view';
import NewProject from '@/sections/workspace/new_project';
import { Plus } from '@phosphor-icons/react';
import { userSelector } from '@/slices/userSlice';
import { useSelector } from 'react-redux';
import NoProjects from '@/components/empty_fillers/your_projects';
import { navbarOpenSelector } from '@/slices/feedSlice';
import { SERVER_ERROR } from '@/config/errors';

const YourProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [clickedOnProject, setClickedOnProject] = useState(false);
  const [clickedProjectIndex, setClickedProjectIndex] = useState(-1);

  const [clickedOnNewProject, setClickedOnNewProject] = useState(false);

  const [fadeIn, setFadeIn] = useState(true);

  const navbarOpen = useSelector(navbarOpenSelector);
  const user = useSelector(userSelector);

  const getProjects = () => {
    setLoading(true);
    const URL = `${WORKSPACE_URL}/my`;
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
    <div className="w-full px-2">
      {clickedOnNewProject ? <NewProject setShow={setClickedOnNewProject} setProjects={setProjects} /> : <></>}

      <div
        onClick={() => setClickedOnNewProject(true)}
        className="w-taskbar max-md:w-taskbar_md h-taskbar mx-auto text-gray-400 dark:text-gray-200 bg-white dark:bg-gradient-to-l dark:from-dark_primary_gradient_start dark:to-dark_primary_gradient_end px-4 max-md:px-2 py-3 rounded-lg cursor-pointer shadow-md hover:shadow-lg transition-ease-300 border-gray-300 border-[1px] dark:border-0 dark:hover:shadow-outer dark:shadow-outer flex justify-between items-center"
      >
        <div className="font-primary dark:text-gray-200 text-lg pl-2">Create a new project</div>
        <Plus
          size={36}
          className="flex-center rounded-full hover:bg-primary_comp_hover dark:hover:bg-[#e9e9e933] p-2 transition-ease-300"
          weight="regular"
        />
      </div>
      {loading ? (
        <Loader />
      ) : (
        <>
          {projects.length > 0 ? (
            <div
              className={`w-full grid ${
                navbarOpen ? 'grid-cols-3 px-12 gap-12' : 'grid-cols-4 px-12 gap-8'
              } max-lg:grid-cols-3 max-md:grid-cols-1 max-lg:gap-4 max-md:gap-6 max-md:px-4 max-md:justify-items-center py-8 transition-ease-out-500`}
            >
              {clickedOnProject ? (
                <ProjectView
                  projectSlugs={projects.map(project => project.slug)}
                  clickedProjectIndex={clickedProjectIndex}
                  setClickedProjectIndex={setClickedProjectIndex}
                  setClickedOnProject={setClickedOnProject}
                  fadeIn={fadeIn}
                  setFadeIn={setFadeIn}
                  setProjects={setProjects}
                />
              ) : (
                <></>
              )}
              {projects.map((project, index) => {
                return (
                  <ProjectCard
                    key={project.id}
                    index={index}
                    size={80}
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
        </>
      )}
    </div>
  );
};

export default YourProjects;
