import Loader from '@/components/common/loader';
import ProjectCard from '@/components/explore/project_card';
import { WORKSPACE_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import { Project } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import NoProjects from '@/components/fillers/your_projects';
import { SERVER_ERROR } from '@/config/errors';
import SideBarWrapper from '@/wrappers/side';
import FiltersAndOptions from '@/sides/project/filters';
import { convertToRFC3339 } from '@/utils/funcs/misc';
import PrimeWrapper from '@/wrappers/prime';

const CombinedProjects = ({
  setClickedProject,
}: {
  setClickedProject?: React.Dispatch<React.SetStateAction<Project | null>>;
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState('activity');
  const [time, setTime] = useState('');

  const getProjects = (abortController: AbortController) => {
    setLoading(true);
    const URL = `${WORKSPACE_URL}/projects?order=${order}${time ? '&created_at=' + convertToRFC3339(time) : ''}`;
    getHandler(URL, abortController.signal)
      .then(res => {
        if (res.statusCode === 200) {
          const projectsData = res.data.projects || [];

          if (setClickedProject && projectsData.length > 0) setClickedProject(projectsData[0]);

          setProjects(projectsData);
          const projectSlug = new URLSearchParams(window.location.search).get('project');
          if (projectSlug && projectSlug != '') {
            projectsData.forEach((project: Project, index: number) => {
              if (project.slug == projectSlug) {
              }
            });
          }
          setLoading(false);
        } else if (res.status != -1) {
          Toaster.error(res.data.message || SERVER_ERROR, 'error_toaster');
        }
      })
      .catch(err => {
        Toaster.error(SERVER_ERROR, 'error_toaster');
      });
  };

  let oldAbortController: AbortController | null = null;

  useEffect(() => {
    const abortController = new AbortController();
    if (oldAbortController) oldAbortController.abort();
    oldAbortController = abortController;

    getProjects(abortController);
    return () => {
      abortController.abort();
    };
  }, [order, time]);

  return (
    <div className="w-full flex space-x-6">
      <div className="w-3/4 max-md:w-full">
        <PrimeWrapper index={-1} maxIndex={0}>
          {loading ? (
            <Loader />
          ) : projects.length > 0 ? (
            <div className="w-full space-y-4 ">
              {projects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  index={index}
                  project={project}
                  setClickedProject={setClickedProject}
                  isLink
                />
              ))}
            </div>
          ) : (
            <NoProjects />
          )}
        </PrimeWrapper>
      </div>
      <SideBarWrapper>
        <FiltersAndOptions
          order={order}
          setOrder={setOrder}
          orders={['activity', 'most_liked', 'most_viewed', 'latest']}
          time={time}
          setTime={setTime}
          setProjects={setProjects}
        />
      </SideBarWrapper>
    </div>
  );
};

export default CombinedProjects;
