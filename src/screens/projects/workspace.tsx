import Loader from '@/components/common/loader';
import ProjectCard from '@/components/explore/project_card';
import { WORKSPACE_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import { Project } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import NoProjects from '@/components/fillers/your_projects';
import { SERVER_ERROR } from '@/config/errors';
import OrderMenu from '@/components/common/order_menu';
import { useWindowWidth } from '@react-hook/window-size';
import NewProject from '@/sections/workspace/new_project';

const CombinedProjects = ({
  triggerReload,
  setClickedProject,
}: {
  triggerReload?: boolean;
  setClickedProject?: React.Dispatch<React.SetStateAction<Project | null>>;
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState('activity');

  const getProjects = (abortController: AbortController) => {
    setLoading(true);
    const URL = `${WORKSPACE_URL}/projects?order=${order}`;
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

  let oldAbortController: AbortController | null = null;

  useEffect(() => {
    const abortController = new AbortController();
    if (oldAbortController) oldAbortController.abort();
    oldAbortController = abortController;

    getProjects(abortController);
    return () => {
      abortController.abort();
    };
  }, [order, triggerReload]);

  const width = useWindowWidth();
  const isMD = width < 768;

  return (
    <div className="w-full">
      <OrderMenu orders={['activity', 'most_liked', 'most_viewed', 'latest']} current={order} setState={setOrder} />

      <div className="w-full my-4">
        <NewProject setProjects={setProjects} />
      </div>

      {loading ? (
        <Loader />
      ) : projects.length > 0 ? (
        <div className="w-full">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              index={index}
              project={project}
              setClickedProject={setClickedProject}
              isLink={isMD}
            />
          ))}
        </div>
      ) : (
        <NoProjects />
      )}
    </div>
  );
};

export default CombinedProjects;
