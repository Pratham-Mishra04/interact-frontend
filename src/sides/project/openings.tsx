import React from 'react';
import { PermissionConfig, Project } from '@/types';
import Link from 'next/link';
import moment from 'moment';
import { SidePrimeWrapper } from '@/wrappers/side';
import { checkProjectAccess } from '@/utils/funcs/access';
import { PROJECT_MANAGER } from '@/config/constants';
import AddOpening from '@/sections/workspace/manage_project/new_opening';
import ManageOpenings from '@/sections/workspace/manage_project/manage_openings';
import { useSelector } from 'react-redux';
import { userSelector } from '@/slices/userSlice';
import OpeningBookmarkIcon from '@/components/lowers/opening_bookmark';
interface Props {
  project: Project;
  setProject: React.Dispatch<React.SetStateAction<Project>>;
  permissionConfig?: PermissionConfig;
}

const Openings = ({ project, setProject, permissionConfig }: Props) => {
  const user = useSelector(userSelector);

  return (project.openings && project.openings.length > 0) ||
    checkProjectAccess(user, 'manage_openings', permissionConfig, project.id) ? (
    <SidePrimeWrapper>
      <div className="w-full flex flex-col gap-2">
        <div className="w-full flex items-center justify-between">
          <div className="text-lg font-medium">Active Openings</div>
          {checkProjectAccess(user, 'manage_openings', permissionConfig, project.id) ? (
            <div className="flex-center gap-2">
              <AddOpening project={project} setProject={setProject} org={false} />
              {project.openings && project.openings.length > 0 && (
                <ManageOpenings project={project} setProject={setProject} org={false} />
              )}
            </div>
          ) : (
            <Link href={`/openings?pid=${project.slug}`} className="text-xs text-[#525252]">
              See all
            </Link>
          )}
        </div>
        {project.openings && project.openings.length > 0 && (
          <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4">
            {project.openings.map(opening => {
              return (
                <div
                  key={opening.id}
                  className="relative border-[1px] border-gray-500 dark:border-dark_primary_btn p-4 flex flex-col justify-between gap-2 rounded-md dark:hover:bg-dark_primary_comp_hover transition-ease-300"
                >
                  <div className="w-full flex items-center justify-between">
                    <div className="text-lg font-semibold line-clamp-2">{opening.title}</div>
                    {/* <div className="text-xs">{project.noLikes}</div> */}
                    <OpeningBookmarkIcon opening={opening} />
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
                  {checkProjectAccess(user, 'see_applications', permissionConfig, project.id) ? (
                    <div className="w-full flex items-center gap-1 text-sm">
                      {opening.noApplications} Applications
                      <Link href={`/workspace/manage/applications/${opening.id}`} className="text-xs">
                        {opening.noApplications > 0 && <>(click to view)</>}
                      </Link>
                    </div>
                  ) : (
                    <div className="w-full text-sm line-clamp-2 text-[#525252]">
                      {opening.noApplications > 0 && `${opening.noApplications} Applications`}
                    </div>
                  )}
                  <div className="w-full flex justify-between items-end">
                    <Link
                      href={`/openings?pid=${project.slug}`}
                      className="w-[30%] text-center bg-[#2FB0F6] text-white py-2 rounded-md hover:bg-[#2Fb0ff] transition"
                    >
                      Apply
                    </Link>
                    <div className="text-xs">{moment(opening.createdAt).fromNow()}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SidePrimeWrapper>
  ) : (
    <></>
  );
};

export default Openings;
