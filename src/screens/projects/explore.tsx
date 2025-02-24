import ProjectCard from '@/components/explore/project_card';
import Loader from '@/components/common/loader';
import { SERVER_ERROR } from '@/config/errors';
import { EXPLORE_URL, PROJECT_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import { Project } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useState, useEffect } from 'react';
import NoSearch from '@/components/fillers/search';
import InfiniteScroll from 'react-infinite-scroll-component';
import PrimeWrapper from '@/wrappers/prime';
import SideBarWrapper from '@/wrappers/side';
import FiltersAndOptions from '@/sides/project/filters';
import { convertToRFC3339 } from '@/utils/funcs/misc';
import { useSelector } from 'react-redux';
import { userIDSelector } from '@/slices/userSlice';

const Projects = ({
  setClickedProject,
}: {
  setClickedProject?: React.Dispatch<React.SetStateAction<Project | null>>;
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [order, setOrder] = useState('trending');
  const [category, setCategory] = useState('');
  const [time, setTime] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const fetchProjects = async (search: string | null, cid: string | null, initialPage?: number) => {
    const URL = `${EXPLORE_URL}/projects?page=${initialPage ? initialPage : page}&limit=${10}&order=${order}${
      search ? `&search=${search}` : ''
    }${cid ? '&cid=' + cid : ''}${category ? '&category=' + category : ''}${
      time ? '&created_at=' + convertToRFC3339(time) : ''
    }${tags.length > 0 ? `&tags=${tags.join(',')}` : ''}`;

    const res = await getHandler(URL, undefined, true);
    if (res.statusCode == 200) {
      const projectsData = res.data.projects || [];

      if (initialPage == 1) {
        setProjects(projectsData);

        if (setClickedProject && projectsData.length > 0) setClickedProject(projectsData[0]);
      } else {
        const addedProjects = [...projects, ...projectsData];
        if (addedProjects.length === projects.length) setHasMore(false);
        setProjects(addedProjects);
      }
      setPage(prev => prev + 1);

      setLoading(false);
    } else {
      Toaster.error(res.data.message || SERVER_ERROR, 'error_toaster');
    }
  };

  const fetchProject = async (id: string | null) => {
    setLoading(true);
    const URL = `${PROJECT_URL}/${id}`;

    const res = await getHandler(URL);
    if (res.statusCode == 200) {
      const project = res.data.project;
      if (project) {
        setProjects([project]);
      }

      setLoading(false);
    } else {
      Toaster.error(res.data.message || SERVER_ERROR, 'error_toaster');
    }
  };

  useEffect(() => {
    setPage(1);
    setProjects([]);
    setHasMore(true);
    setLoading(true);
    const pid = new URLSearchParams(window.location.search).get('id');
    if (pid && pid != '') fetchProject(pid);
    else
      fetchProjects(
        new URLSearchParams(window.location.search).get('search'),
        new URLSearchParams(window.location.search).get('cid'),
        1
      );
  }, [window.location.search, order, category, time, tags]);

  const userID = useSelector(userIDSelector);

  return (
    <div className="w-full flex space-x-6">
      <div className="w-3/4 max-md:w-full">
        <PrimeWrapper index={-1} maxIndex={0}>
          {loading ? (
            <Loader />
          ) : (
            <div className="w-full">
              {projects.length > 0 ? (
                <InfiniteScroll
                  className="w-full space-y-4 "
                  dataLength={projects.length}
                  next={() =>
                    fetchProjects(
                      new URLSearchParams(window.location.search).get('search'),
                      new URLSearchParams(window.location.search).get('cid')
                    )
                  }
                  hasMore={hasMore}
                  loader={<Loader />}
                >
                  {projects.map(project => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      setClickedProject={setClickedProject}
                      isLink={true}
                    />
                  ))}
                </InfiniteScroll>
              ) : (
                <NoSearch />
              )}
            </div>
          )}
        </PrimeWrapper>
      </div>
      <SideBarWrapper>
        <FiltersAndOptions
          order={order}
          setOrder={setOrder}
          orders={['trending', 'most_liked', 'most_viewed', ...(userID ? ['latest', 'last_viewed'] : [])]}
          category={category}
          setCategory={setCategory}
          time={time}
          setTime={setTime}
          tags={tags}
          setTags={setTags}
        />
      </SideBarWrapper>
    </div>
  );
};

export default Projects;
