import ProjectCard from '@/components/explore/project_card';
import { Project } from '@/types';
import React, { useEffect, useState } from 'react';
import ProjectView from '../../sections/explore/project_view';
import { useSelector } from 'react-redux';
import { navbarOpenSelector } from '@/slices/feedSlice';
import NewProject from '@/sections/workspace/new_project';
import NoUserItems from '@/components/empty_fillers/user_items';
import { EXPLORE_URL } from '@/config/routes';
import { SERVER_ERROR } from '@/config/errors';
import getHandler from '@/handlers/get_handler';
import Toaster from '@/utils/toaster';
import InfiniteScroll from 'react-infinite-scroll-component';
import Loader from '@/components/common/loader';
import checkOrgAccess from '@/utils/funcs/check_org_access';
import { ORG_MANAGER } from '@/config/constants';
import { userIDSelector } from '@/slices/userSlice';
import Mascot from '@/components/empty_fillers/mascot';

interface Props {
  userID: string;
  displayOnProfile?: boolean;
  contributing?: boolean;
  org?: boolean;
}

const Projects = ({ userID, displayOnProfile = false, contributing = false, org = false }: Props) => {
  const [clickedOnProject, setClickedOnProject] = useState(false);
  const [clickedProjectIndex, setClickedProjectIndex] = useState(-1);
  const [clickedOnNewProject, setClickedOnNewProject] = useState(false);

  const [fadeInProject, setFadeInProject] = useState(true);

  const navbarOpen = useSelector(navbarOpenSelector);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const getProjects = () => {
    setLoading(true);
    const URL = `${EXPLORE_URL}/users/projects${
      contributing ? '/contributing' : ''
    }/${userID}?page=${page}&limit=${10}`;
    getHandler(URL)
      .then(res => {
        if (res.statusCode === 200) {
          const addProjects = [...projects, ...(res.data.projects || [])];
          if (addProjects.length === projects.length) setHasMore(false);
          setProjects(addProjects);
          setPage(prev => prev + 1);
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
  }, [userID]);

  return (
    <div className="w-full px-2 pb-base_padding max-md:px-0 max-md:pb-2 z-50">
      {/* {displayOnProfile && (
        <>
          {clickedOnNewProject ? <NewProject setShow={setClickedOnNewProject} setProjects={setProjects} /> : <></>}
          {checkOrgAccess(ORG_MANAGER) || loggedInUserID == userID ? (
            <div
              onClick={() => setClickedOnNewProject(true)}
              className={`mb-8 w-108 max-md:w-5/6 h-24 max-md:hover:scale-105 hover:scale-125 group relative overflow-clip bg-white hover:bg-[#f3f3f3] mx-auto border-[1px] pattern1 rounded-lg cursor-pointer flex-center flex-col transition-ease-300`}
            >
              <div className="backdrop-blur-md opacity-0 group-hover:opacity-60 w-2/3 h-2/3 rounded-xl transition-ease-out-300"></div>
              <div className="font-extrabold text-xl group-hover:text-2xl text-gradient absolute translate-y-0 group-hover:-translate-y-2 transition-ease-out-300">
                Create a new Project!
              </div>
              <div className="text-xs font-semibold text-primary_black absolute translate-x-0 translate-y-16 group-hover:translate-y-4 transition-ease-out-300">
                Woohooh! New Project! Who Dis?
              </div>
            </div>
          ) : (
            <></>
          )}
        </>
      )} */}
      <InfiniteScroll
        dataLength={projects.length}
        next={getProjects}
        hasMore={hasMore}
        loader={<Loader />}
        className={`${
          projects?.length > 0 || displayOnProfile
            ? 'w-fit grid'
            : org
            ? 'w-full'
            : 'w-[45vw] max-lg:w-[85%] max-md:w-screen'
        } ${
          projects.length == 1
            ? 'grid-cols-1'
            : navbarOpen
            ? org
              ? 'grid-cols-3 gap-6'
              : 'grid-cols-2 gap-6'
            : 'grid-cols-3 gap-8'
        } max-md:grid-cols-1 mx-auto max-md:gap-6 max-md:px-4 max-md:justify-items-center transition-ease-out-500`}
      >
        {projects?.length > 0 ? (
          <>
            {clickedOnProject ? (
              <ProjectView
                projectSlugs={projects.map(project => project.slug)}
                clickedProjectIndex={clickedProjectIndex}
                setClickedProjectIndex={setClickedProjectIndex}
                setClickedOnProject={setClickedOnProject}
                fadeIn={fadeInProject}
                setFadeIn={setFadeInProject}
              />
            ) : (
              <></>
            )}
            {projects.map((project, index) => {
              return (
                <ProjectCard
                  key={project.id}
                  index={index}
                  project={project}
                  size={org ? 72 : 64}
                  setClickedOnProject={setClickedOnProject}
                  setClickedProjectIndex={setClickedProjectIndex}
                />
              );
            })}
          </>
        ) : org ? (
          <div className="w-5/6 mx-auto">
            <Mascot message="This organization is as quiet as a library at midnight. Shh, no projects yet." />
          </div>
        ) : (
          <>{!displayOnProfile ? <NoUserItems /> : <></>}</>
        )}
      </InfiniteScroll>
    </div>
  );
};

export default Projects;
