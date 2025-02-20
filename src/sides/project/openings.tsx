import React from 'react';
import { Project } from '@/types';
import Link from 'next/link';
import moment from 'moment';
import { SidePrimeWrapper } from '@/wrappers/side';
import { checkProjectAccess } from '@/utils/funcs/access';
import { PROJECT_MANAGER } from '@/config/constants';
import AddOpening from '@/sections/workspace/manage_project/new_opening';
import ManageOpenings from '@/sections/workspace/manage_project/manage_openings';
import { useSelector } from 'react-redux';
import { userSelector } from '@/slices/userSlice';

interface Props {
  project: Project;
  setProject: React.Dispatch<React.SetStateAction<Project>>;
}

const Openings = ({ project, setProject }: Props) => {
  const user = useSelector(userSelector);

  return (project.openings && project.openings.length > 0) || checkProjectAccess(user, PROJECT_MANAGER, project.id) ? (
    <SidePrimeWrapper>
      <div className="w-full flex flex-col gap-2">
        <div className="w-full flex items-center justify-between">
          <div className="text-lg font-medium">Active Openings</div>
          {checkProjectAccess(user, PROJECT_MANAGER, project.id) ? (
            <div className="flex-center gap-2">
              <AddOpening project={project} setProject={setProject} org={false} />
              {project.openings && project.openings.length > 0 && (
                <ManageOpenings project={project} setProject={setProject} org={false} />
              )}
            </div>
          ) : (
            <Link href={`/openings?pid=${project.slug}`} className="text-xs">
              view all
            </Link>
          )}
        </div>
        {project.openings && project.openings.length > 0 && (
          <div
            className={`w-full flex flex-wrap ${
              project.openings.length == 1 ? 'justify-start' : 'justify-evenly'
            } max-lg:grid max-lg:grid-cols-3 max-md:flex max-md:justify-center gap-2`}
          >
            {project.openings.map(opening => {
              return (
                <Link
                  key={opening.id}
                  href={`/openings?pid=${project.slug}`}
                  className="w-full relative border-[1px] border-gray-500 dark:border-dark_primary_btn p-3 flex flex-col gap-2 rounded-md dark:hover:bg-dark_primary_comp_hover transition-ease-300"
                >
                  <div className="w-full flex items-center justify-between">
                    <div className="text-lg font-semibold line-clamp-2">{opening.title}</div>
                    <div className="text-xs">{moment(opening.createdAt).fromNow()}</div>

                    {/* <div
                    onClick={el => {
                      el.preventDefault();
                      el.stopPropagation();
                    }}
                    className="z-20"
                  >
                    <OpeningBookmarkIcon opening={opening} />
                  </div> */}
                  </div>
                  {checkProjectAccess(user, PROJECT_MANAGER, project.id) ? (
                    <div className="w-full flex items-center gap-1 text-sm">
                      {opening.noApplications} Applications
                      <Link href={`/workspace/manage/applications/${opening.id}`} className="text-xs">
                        {opening.noApplications > 0 && <>(click to view)</>}
                      </Link>
                    </div>
                  ) : (
                    <div className="w-full text-sm line-clamp-2">{opening.description}</div>
                  )}
                </Link>
              );
            })}
            {project.openings.length > 5 && (
              <Link
                href={`/openings?pid=${project.slug}`}
                className="w-full relative border-[1px] text-primary_black border-gray-500 p-4 flex-center flex-col gap-2 rounded-md hover:shadow-2xl transition-ease-300"
              >
                <div className="border-2 border-dashed border-gray-500 text-lg rounded-full w-12 h-12 flex-center font-semibold">
                  +{project.openings.length - 1}
                </div>
                <div className="text-sm">click here to view all</div>
              </Link>
            )}
          </div>
        )}
      </div>
    </SidePrimeWrapper>
  ) : (
    <></>
  );
};

export default Openings;
