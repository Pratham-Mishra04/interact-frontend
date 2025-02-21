import ProjectCard from '@/components/explore/project_card';
import { Project } from '@/types';
import React, { useEffect, useState } from 'react';
import NoUserItems from '@/components/fillers/user_items';
import { EXPLORE_URL } from '@/config/routes';
import { SERVER_ERROR } from '@/config/errors';
import getHandler from '@/handlers/get_handler';
import Toaster from '@/utils/toaster';
import Mascot from '@/components/fillers/mascot';
import Loader from '@/components/common/loader';

interface Props {
  userID: string;
  displayOnProfile?: boolean;
  contributing?: boolean;
  org?: boolean;
}

const Projects = ({ userID, displayOnProfile = false, contributing = false, org = false }: Props) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const getProjects = () => {
    setLoading(true);
    const URL = `${EXPLORE_URL}/users/projects${contributing ? '/contributing' : ''}/${userID}`;
    getHandler(URL, undefined, true)
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
  }, [userID, contributing]);

  return (
    <div className={`${org ? 'w-5/6 max-md:w-full mx-auto' : 'w-full'}`}>
      {loading ? (
        <Loader />
      ) : projects?.length > 0 ? (
        projects.map((project, index) => {
          return <ProjectCard key={project.id} index={index} project={project} isLink />;
        })
      ) : org ? (
        <div className="w-5/6 mx-auto">
          <Mascot message="This organization is as quiet as a library at midnight. Shh, no projects yet." />
        </div>
      ) : (
        <NoUserItems />
      )}
      {displayOnProfile && (
        <div className="w-fit mx-auto text-sm text-gray-500 dark:text-gray-200 mt-2">
          Hidden Projects will not be shown here.
        </div>
      )}
    </div>
  );
};

export default Projects;
