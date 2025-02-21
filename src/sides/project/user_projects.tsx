import React, { useEffect, useState } from 'react';
import { Project, User } from '@/types';
import { SERVER_ERROR } from '@/config/errors';
import { EXPLORE_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import Toaster from '@/utils/toaster';
import ProjectCard from '../../components/explore/project_card';
import { SidePrimeWrapper } from '@/wrappers/side';

interface Props {
  user: User;
  projectID: string;
}

const UserProjects = ({ user, projectID }: Props) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = () => {
    const URL = `${EXPLORE_URL}/users/projects/${user.id}`;
    getHandler(URL, undefined, true)
      .then(res => {
        if (res.statusCode === 200) {
          setProjects((res.data.projects || []).filter((project: Project) => project.id !== projectID));
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
    setProjects([]);
    fetchProjects();
  }, [user]);

  return projects.length > 0 ? (
    <SidePrimeWrapper>
      <div className="w-full flex flex-col gap-2">
        <div className="text-lg font-semibold">More from {user.name}</div>
        <div className="w-full">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} isLink smaller />
          ))}
        </div>
      </div>
    </SidePrimeWrapper>
  ) : (
    <></>
  );
};

export default UserProjects;
