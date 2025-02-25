import React, { ReactNode } from 'react';
import { Project } from '@/types';
import { BookmarkSimple, Eye, EyeSlash, HeartStraight, SuitcaseSimple, Warning } from '@phosphor-icons/react';
import Link from 'next/link';
import UserHoverCard from './user_hover_card';
import ProjectCardCarousel from './project_card_carousel';
import TooltipIcon from '../common/tooltip_icon';
import moment from 'moment';
import Tags from '../common/tags';
import PictureList from '../common/picture_list';

interface Props {
  index?: number;
  project: Project;
  setClickedProject?: React.Dispatch<React.SetStateAction<Project | null>>;
  isLink?: boolean;
  smaller?: boolean;
}

const ProjectCard = ({ project, setClickedProject, isLink = false, smaller = false }: Props) => {
  const Wrapper: React.FC<{ children: ReactNode }> = ({ children }) =>
    isLink ? (
      <Link
        href={`/projects/${project.slug}`}
        className={`w-full flex items-center ${
          smaller ? 'gap-2' : 'gap-4'
        } hover:bg-primary_comp_hover dark:hover:bg-dark_primary_comp_active rounded-[12px]  transition-ease-out-500 animate-fade_third`}
      >
        {children}
      </Link>
    ) : (
      <div
        onClick={() => {
          if (setClickedProject) setClickedProject(project);
        }}
        className={`w-full flex items-center ${
          smaller ? 'gap-2' : 'gap-4'
        } hover:bg-primary_comp_hover dark:hover:bg-dark_primary_comp_hover rounded-[12px] cursor-pointer transition-ease-out-500 animate-fade_third`}
      >
        {children}
      </div>
    );

  return (
    <Wrapper>
      <div
        className={`border-[#404040] dark:border-[#525252] ${
          !smaller ? 'p-3' : ''
        } border-[1px] p-2 rounded-[12px] w-full relative`}
      >
        <div className="w-full">
          {!smaller && (
            <div className="absolute top-2 right-3 text-xs">{moment(new Date(project.createdAt)).fromNow()}</div>
          )}
          <div className={`w-full flex flex-row ${!smaller ? 'gap-4 mb-4' : 'gap-2'} items-center`}>
            <ProjectCardCarousel project={project} width="1/5" />
            <div className={`h-full ${smaller ? 'w-4/5' : 'w-3/4'} flex flex-col justify-between`}>
              <div className="w-full">
                <div className={`${!smaller && 'text-xl'} max-md:text-base font-medium line-clamp-1`}>
                  {!smaller ? project.title : project.title.slice(0, 27) + (project.title.length > 25 ? '...' : '')}
                </div>
                <div className="text-sm max-md:text-xs line-clamp-1 text-[#727272]">
                  {!smaller
                    ? project.tagline
                    : project.tagline.slice(0, 30) + (project.tagline.length > 25 ? '...' : '')}
                </div>
              </div>
              {!smaller && (
                <div className="w-full flex items-center mt-2">
                  <PictureList
                    users={[project.user, ...(project?.memberships?.map(m => m.user) || [])]}
                    showMoreText={false}
                    gap={2}
                  />
                  <UserHoverCard
                    trigger={<div className="hover:underline underline-offset-2">{project.user.name}</div>}
                    user={project.user}
                  />
                  {project.noMembers - 1 > 0 && <div className="ml-1">+ {project.noMembers - 1} others</div>}
                </div>
              )}
            </div>
          </div>
          {!smaller &&
            (project.isFlagged ? (
              <TooltipIcon
                label="This Project is Flagged!."
                icon={<Warning size={20} />}
                excludeHoverEffect
                className="text-primary_danger"
              />
            ) : project.isPrivate ? (
              <TooltipIcon label="This project is private." icon={<EyeSlash size={20} />} excludeHoverEffect />
            ) : (
              <div className={`${project.noOpenings > 0 ? 'space-y-4' : 'space-y-2'}`}>
                <Tags
                  tags={project.tags}
                  limit={60}
                  className="border-[1px] border-[#2FB0F6] dark:border-[#2FB0F6] text-[#2FB0F6] dark:text-[#2FB0F6] py-2 px-3"
                />
                <div className="flex items-center justify-between gap-6 w-full">
                  {project.noOpenings > 0 ? (
                    <div className=" text-white flex-center gap-2 bg-[#2FB0F6] text-sm rounded-md px-3 py-1.5">
                      <SuitcaseSimple /> <div>{project.noOpenings} Openings</div>
                    </div>
                  ) : (
                    <div></div>
                  )}
                  <div className="flex space-x-4">
                    <div className="flex items-center gap-1 text-xs max-md:hidden">
                      <TooltipIcon label="Likes" icon={<HeartStraight size={20} />} excludeHoverEffect />
                      <div>{project.noLikes > 0 && project.noLikes}</div>
                    </div>
                    <div className="flex items-center gap-1 text-xs max-md:hidden">
                      <TooltipIcon label="Bookmarks" icon={<BookmarkSimple size={20} />} excludeHoverEffect />
                      <div>{project.noBookmarks > 0 && project.noBookmarks}</div>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <TooltipIcon label="Impressions" icon={<Eye size={20} />} excludeHoverEffect />
                      <div>{project.noImpressions}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
        {smaller && (
          <div className="flex flex-row justify-between w-full">
            <div className="w-full mt-2 flex flex-row justify-start items-start mb-1">
              <div>
                <Tags
                  tags={project.tags}
                  limit={20}
                  className="border-[1px] border-[#2FB0F6] dark:border-[#2FB0F6] text-[#2FB0F6] dark:text-[#2FB0F6] py-1 px-2"
                />
              </div>
            </div>
            <div className="flex items-center justify-end">
              <div className="flex space-x-4">
                <div className="flex items-center gap-1 text-xs max-md:hidden">
                  <TooltipIcon label="Likes" icon={<HeartStraight size={20} />} excludeHoverEffect />
                  <div>{project.noLikes}</div>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <TooltipIcon label="Impressions" icon={<Eye size={20} />} excludeHoverEffect />
                  <div>{project.noImpressions}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Wrapper>
  );
};

export default React.memo(ProjectCard);
