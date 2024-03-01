import Loader from '@/components/common/loader';
import ProjectCard from '@/components/workspace/project_card';
import { WORKSPACE_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import { Project } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import ProjectView from '../../sections/workspace/project_view';
import NoProjects from '@/components/empty_fillers/contributing_projects';
import { navbarOpenSelector } from '@/slices/feedSlice';
import { useSelector } from 'react-redux';
import { SERVER_ERROR } from '@/config/errors';

const ContributingProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [clickedOnProject, setClickedOnProject] = useState(false);
  const [clickedProjectIndex, setClickedProjectIndex] = useState(-1);

  const [fadeIn, setFadeIn] = useState(true);

  const navbarOpen = useSelector(navbarOpenSelector);

  const getProjects = () => {
    const URL = `${WORKSPACE_URL}/contributing`;
    getHandler(URL)
      .then(res => {
        if (res.statusCode === 200) {
          setProjects(res.data.projects || []);
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
    getProjects();
  }, []);
  return (
    <div>
      {loading ? (
        <Loader />
      ) : (
        <>
          {projects.length > 0 ? (
            <div
              className={`w-full grid ${
                navbarOpen ? 'grid-cols-3 px-12 gap-12' : 'grid-cols-4 px-12 gap-12'
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
            <NoProjects />
          )}
        </>
      )}
    </div>
  );
};

export default ContributingProjects;
